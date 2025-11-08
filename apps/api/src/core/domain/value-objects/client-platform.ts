import type { NewType } from "@mona-ca/core/utils";
import { t } from "elysia";

export type MobilePlatform = NewType<"clientPlatform", "mobile">;
export type WebPlatform = NewType<"clientPlatform", "web">;
export type ClientPlatform = MobilePlatform | WebPlatform;

export const newMobilePlatform = (rawClientType: "mobile") => {
	return rawClientType as MobilePlatform;
};
export const newWebPlatform = (rawClientType: "web") => {
	return rawClientType as WebPlatform;
};
export const newClientPlatform = (rawClientType: "web" | "mobile") => {
	return rawClientType as ClientPlatform;
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
