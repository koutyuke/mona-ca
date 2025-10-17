import type { NewType, ToPrimitive } from "@mona-ca/core/utils";
import { StringEnum } from "../../../../lib/schemas";

export type ExternalIdentityProvider = NewType<"ExternalIdentityProvider", "discord" | "google">;

export const newExternalIdentityProvider = (raw: ToPrimitive<ExternalIdentityProvider>) => {
	return raw as ExternalIdentityProvider;
};

export const externalIdentityProviderSchema = StringEnum(["discord", "google"]);

export type ExternalIdentityProviderUserId = NewType<"ExternalIdentityProviderUserId", string>;

export const newExternalIdentityProviderUserId = (rawExternalIdentityProviderUserId: string) => {
	return rawExternalIdentityProviderUserId as ExternalIdentityProviderUserId;
};
