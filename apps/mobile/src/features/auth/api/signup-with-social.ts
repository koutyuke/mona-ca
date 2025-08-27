import { type Err, type Ok, type Result, err, ok } from "@mona-ca/core/utils";
import { WebBrowserResultType, openAuthSessionAsync } from "expo-web-browser";
import { getSocialAuthURLString } from "../lib/get-social-auth-url-string";
import type { SupportProvider } from "../model/support-provider";

type Success = Ok<{
	sessionToken: string;
}>;

type Error =
	| Err<
			| "ACCESS_DENIED"
			| "FAILED_TO_GET_ACCOUNT_INFO"
			| "ACCOUNT_INFO_INVALID"
			| "TOO_MANY_REQUESTS"
			| "ACCOUNT_ALREADY_REGISTERED"
			| "UNKNOWN_ERROR",
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

export const signupWithSocial = async (provider: SupportProvider): Promise<Result<Success, Error>> => {
	const redirectURI = `mona-ca://signup/${provider}`;

	const urlString = getSocialAuthURLString(provider, "signup", redirectURI);

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
		if (error === "OAUTH_ACCESS_DENIED") {
			return err("ACCESS_DENIED", {
				errorMessage: "アクセスが拒否されました",
			});
		}

		if (error === "OAUTH_PROVIDER_ERROR" || error === "FAILED_TO_FETCH_OAUTH_ACCOUNT") {
			return err("FAILED_TO_GET_ACCOUNT_INFO", {
				errorMessage: "アカウント情報の取得に失敗しました",
			});
		}

		if (error === "OAUTH_ACCOUNT_INFO_INVALID") {
			return err("ACCOUNT_INFO_INVALID", {
				errorMessage: "アカウントの情報(メールアドレスなど)が正しくありません",
			});
		}

		if (error === "OAUTH_ACCOUNT_ALREADY_REGISTERED") {
			return err("ACCOUNT_ALREADY_REGISTERED", {
				errorMessage: "アカウントが既に登録されています",
			});
		}

		if (error === "OAUTH_ACCOUNT_NOT_FOUND_BUT_LINKABLE" && accountAssociationSessionToken) {
			return err("ACCOUNT_ASSOCIATION", {
				associationSessionToken: accountAssociationSessionToken,
			});
		}

		return err("UNKNOWN_ERROR", {
			errorMessage: "エラーが発生しました",
		});
	}

	if (!sessionToken) {
		return err("UNKNOWN_ERROR", {
			errorMessage: "エラーが発生しました",
		});
	}

	return ok({
		sessionToken,
	});
};
