import { StringEnum } from "../../common/schemas";
import type { NewType } from "../../common/utils";

export type OAuthProvider = NewType<"oauth-provider", "discord">;

export const newOAuthProvider = (raw: "discord") => {
	return raw as OAuthProvider;
};

export const oauthProviderSchema = StringEnum(["discord"]);

export type OAuthProviderId = NewType<"OAuthProviderId", string>;

export const newOAuthProviderId = (rawOAuthProviderId: string) => {
	return rawOAuthProviderId as OAuthProviderId;
};
