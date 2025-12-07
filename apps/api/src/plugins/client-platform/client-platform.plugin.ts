import { CLIENT_PLATFORM_HEADER_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { clientPlatformSchema, newClientPlatform } from "../../core/domain/value-objects";

export const clientPlatformPlugin = () =>
	new Elysia({
		name: "@mona-ca/client-platform",
	})
		.guard({
			schema: "standalone",
			headers: t.Object({
				[CLIENT_PLATFORM_HEADER_NAME]: t.Optional(clientPlatformSchema),
			}),
		})
		.resolve(({ headers: { [CLIENT_PLATFORM_HEADER_NAME]: rawClientPlatform = "web" } }) => {
			return {
				clientPlatform: newClientPlatform(rawClientPlatform),
			};
		})
		.as("scoped");
