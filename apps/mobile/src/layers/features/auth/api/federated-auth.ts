import type { Err, Ok, Result } from "@mona-ca/core/result";
import { err, ok } from "@mona-ca/core/result";
import { WebBrowserResultType, openAuthSessionAsync } from "expo-web-browser";
import * as v from "valibot";
import { federatedAuthURL } from "../lib/federated-auth-url";
import type { SupportProvider } from "../model/support-provider";

const flowSchema = v.union([v.literal("login"), v.literal("signup")]);
const errorSchema = v.picklist([
	"PROVIDER_ACCESS_DENIED",
	"PROVIDER_ERROR",
	"TOKEN_EXCHANGE_FAILED",
	"FETCH_IDENTITY_PROVIDER_USER_FAILED",
	"ACCOUNT_LINK_AVAILABLE",
]);

type Success = Ok<{
	flow: "login" | "signup";
	sessionToken: string;
}>;

type Error =
	| Err<
			"ACCESS_DENIED" | "PROVIDER_ERROR" | "UNKNOWN_ERROR",
			{
				errorMessage: string;
			}
	  >
	| Err<
			"ACCOUNT_LINK",
			{
				linkToken: string;
			}
	  >;

export const federatedAuth = async (provider: SupportProvider): Promise<Result<Success, Error>> => {
	const redirectURI = `mona-ca://auth/federated/${provider}`;

	const url = federatedAuthURL(provider, redirectURI);

	const authRes = await openAuthSessionAsync(url.toString(), redirectURI);

	if (authRes.type === WebBrowserResultType.CANCEL) {
		return err("ACCESS_DENIED", {
			errorMessage: "Access denied",
		});
	}

	if (authRes.type !== "success") {
		return err("UNKNOWN_ERROR", {
			errorMessage: "An error occurred. Please try again later.",
		});
	}

	const parsedUrl = new URL(authRes.url);

	const sessionToken = parsedUrl.searchParams.get("session-token");
	const flow = parsedUrl.searchParams.get("flow");

	if (sessionToken && v.is(flowSchema, flow)) {
		return ok({
			sessionToken,
			flow,
		});
	}

	const error = parsedUrl.searchParams.get("error");
	const linkToken = parsedUrl.searchParams.get("link-token");

	if (v.is(errorSchema, error)) {
		if (error === "PROVIDER_ACCESS_DENIED") {
			return err("ACCESS_DENIED", {
				errorMessage: "Access denied",
			});
		}
		if (error === "PROVIDER_ERROR") {
			return err("PROVIDER_ERROR", {
				errorMessage: "Provider error",
			});
		}
		if (error === "TOKEN_EXCHANGE_FAILED") {
			return err("PROVIDER_ERROR", {
				errorMessage: "Token exchange failed",
			});
		}
		if (error === "FETCH_IDENTITY_PROVIDER_USER_FAILED") {
			return err("PROVIDER_ERROR", {
				errorMessage: "Fetch identity provider user failed",
			});
		}
		if (error === "ACCOUNT_LINK_AVAILABLE" && linkToken) {
			return err("ACCOUNT_LINK", {
				linkToken,
			});
		}
	}

	return err("UNKNOWN_ERROR", { errorMessage: "An error occurred. Please try again later." });
};
