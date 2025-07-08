import { StringEnum } from "../../common/schemas";
import type { NewType, ToPrimitive } from "../../common/utils";

export type OAuthProvider = NewType<"oauth-provider", "discord" | "google">;

export const newOAuthProvider = (raw: ToPrimitive<OAuthProvider>) => {
	return raw as OAuthProvider;
};

export const oauthProviderSchema = StringEnum(["discord", "google"]);

export type OAuthProviderId = NewType<"OAuthProviderId", string>;

export const newOAuthProviderId = (rawOAuthProviderId: string) => {
	return rawOAuthProviderId as OAuthProviderId;
};
