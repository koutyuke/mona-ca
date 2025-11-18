import type { NewType } from "@mona-ca/core/utils";
import { t } from "elysia";

// type
export type DiscordProvider = NewType<"DiscordProvider", "discord">;
export type GoogleProvider = NewType<"GoogleProvider", "google">;
export type IdentityProviders = DiscordProvider | GoogleProvider;

export type IdentityProvidersUserId = NewType<"IdentityProvidersUserId", string>;

export type RawIdentityProviders = "discord" | "google";

// factory
export const newDiscordProvider = (raw: "discord") => {
	return raw as DiscordProvider;
};
export const newGoogleProvider = (raw: "google") => {
	return raw as GoogleProvider;
};
export const newIdentityProviders = (raw: RawIdentityProviders) => {
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
export const discordProviderSchema = t.Literal("discord");
export const googleProviderSchema = t.Literal("google");
export const identityProvidersSchema = t.Union([discordProviderSchema, googleProviderSchema]);
