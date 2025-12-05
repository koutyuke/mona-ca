import type { Brand } from "@mona-ca/core/types";
import { t } from "elysia";

// type
export type RawDiscordProvider = "discord";
export type DiscordProvider = Brand<"IdentityProvider", RawDiscordProvider>;
export type RawGoogleProvider = "google";
export type GoogleProvider = Brand<"IdentityProvider", RawGoogleProvider>;

export type RawIdentityProviders = RawDiscordProvider | RawGoogleProvider;
export type IdentityProviders = DiscordProvider | GoogleProvider;

export type IdentityProvidersUserId = Brand<"IdentityProvidersUserId", string>;

// factory
export const newDiscordProvider = (raw: RawDiscordProvider): DiscordProvider => {
	return raw as DiscordProvider;
};
export const newGoogleProvider = (raw: RawGoogleProvider): GoogleProvider => {
	return raw as GoogleProvider;
};
export const newIdentityProviders = (raw: RawIdentityProviders): IdentityProviders => {
	return raw as IdentityProviders;
};

export const newIdentityProvidersUserId = (rawIdentityProvidersUserId: string) => {
	return rawIdentityProvidersUserId as IdentityProvidersUserId;
};

export const isDiscordProvider = (provider: IdentityProviders): provider is DiscordProvider => {
	return provider === "discord";
};
export const isGoogleProvider = (provider: IdentityProviders): provider is GoogleProvider => {
	return provider === "google";
};

// schema
export const discordProviderSchema = t.Literal<RawDiscordProvider>("discord");
export const googleProviderSchema = t.Literal<RawGoogleProvider>("google");
export const identityProvidersSchema = t.Union([discordProviderSchema, googleProviderSchema]);
