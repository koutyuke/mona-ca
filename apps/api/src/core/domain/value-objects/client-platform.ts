import type { Brand } from "@mona-ca/core/types";
import { t } from "elysia";

export type RawMobilePlatform = "mobile";
export type MobilePlatform = Brand<"ClientPlatform", RawMobilePlatform>;

export type RawWebPlatform = "web";
export type WebPlatform = Brand<"ClientPlatform", RawWebPlatform>;

export type RawClientPlatform = RawMobilePlatform | RawWebPlatform;
export type ClientPlatform = MobilePlatform | WebPlatform;

export const newMobilePlatform = (rawClientPlatform: RawMobilePlatform) => {
	return rawClientPlatform as MobilePlatform;
};
export const newWebPlatform = (rawClientPlatform: RawWebPlatform) => {
	return rawClientPlatform as WebPlatform;
};
export const newClientPlatform = (rawClientPlatform: RawClientPlatform) => {
	return rawClientPlatform as ClientPlatform;
};

export const isMobilePlatform = (clientPlatform: ClientPlatform): clientPlatform is MobilePlatform => {
	return clientPlatform === "mobile";
};
export const isWebPlatform = (clientPlatform: ClientPlatform): clientPlatform is WebPlatform => {
	return clientPlatform === "web";
};

export const mobilePlatformSchema = t.Literal("mobile");
export const webPlatformSchema = t.Literal("web");
export const clientPlatformSchema = t.Union([mobilePlatformSchema, webPlatformSchema]);
