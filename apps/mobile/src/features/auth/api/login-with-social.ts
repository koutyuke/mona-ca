import { type Err, type Ok, type Result, err, ok } from "@mona-ca/core/utils";
import { WebBrowserResultType, openAuthSessionAsync } from "expo-web-browser";
import { getSocialAuthURLString } from "../lib/get-social-auth-url-string";
import type { SupportProvider } from "../model/support-provider";

type Success = Ok<{
	sessionToken: string;
}>;

type Error =
	| Err<
			"ACCESS_DENIED" | "NOT_SIGNED_UP" | "FAILED_TO_GET_ACCOUNT_INFO" | "UNKNOWN_ERROR",
			{
				errorMessage: string;
			}
	  >
	| Err<
			"ACCOUNT_ASSOCIATION",
			{
				associationSessionToken: string;
			}
	  >;

export const loginWithSocial = async (provider: SupportProvider): Promise<Result<Success, Error>> => {
	const redirectURI = `mona-ca://login/${provider}`;

	const urlString = getSocialAuthURLString(provider, "login", redirectURI);

	const authRes = await openAuthSessionAsync(urlString, redirectURI);

	if (authRes.type === WebBrowserResultType.CANCEL) {
		return err("ACCESS_DENIED", {
			errorMessage: "アクセスがキャンセルされました",
		});
	}

	if (authRes.type !== "success") {
		return err("UNKNOWN_ERROR", {
			errorMessage: "エラーが発生しました",
		});
	}

	const parsedUrl = new URL(authRes.url);

	const sessionToken = parsedUrl.searchParams.get("access-token");
	const error = parsedUrl.searchParams.get("error");
	const accountAssociationSessionToken = parsedUrl.searchParams.get("account-association-session-token");

	if (error) {
		if (error === "FAILED_TO_FETCH_OAUTH_ACCOUNT" || error === "OAUTH_PROVIDER_ERROR") {
			return err("FAILED_TO_GET_ACCOUNT_INFO", {
				errorMessage: "アカウント情報の取得に失敗しました",
			});
		}

		if (error === "OAUTH_ACCESS_DENIED") {
			return err("ACCESS_DENIED", {
				errorMessage: "アクセスが拒否されました",
			});
		}

		if (error === "OAUTH_ACCOUNT_NOT_FOUND") {
			return err("NOT_SIGNED_UP", {
				errorMessage: "未登録のアカウントです",
			});
		}

		if (error === "OAUTH_ACCOUNT_NOT_FOUND_BUT_LINKABLE" && accountAssociationSessionToken) {
			return err("ACCOUNT_ASSOCIATION", {
				associationSessionToken: accountAssociationSessionToken,
			});
		}

		if (error === "OAUTH_ACCOUNT_INFO_INVALID") {
			return err("FAILED_TO_GET_ACCOUNT_INFO", {
				errorMessage: "アカウントの情報(メールアドレスなど)が正しくありません",
			});
		}

		return err("UNKNOWN_ERROR", {
			errorMessage: "エラーが発生しました",
		});
	}

	if (sessionToken) {
		return ok({
			sessionToken,
		});
	}

	return err("UNKNOWN_ERROR", {
		errorMessage: "エラーが発生しました",
	});
};
