import { cors as corsPlugin } from "@elysiajs/cors";
import { CLIENT_PLATFORM_HEADER_NAME } from "@mona-ca/core/http";
import { Elysia } from "elysia";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { env } from "../core/infra/config/env";
import { DEV_ORIGIN_REGEX, PROD_ORIGIN_REGEX } from "../core/lib/http";
import { containerPlugin } from "../plugins/container";
import { ipAddressPlugin } from "../plugins/ip-address";
import { openapiPlugin } from "../plugins/openapi";
import { pathDetail } from "../plugins/openapi";
import { AuthRoutes } from "./auth";
import { UsersRoutes } from "./users";

globalThis.Buffer = Buffer;

export default new Elysia({
	adapter: CloudflareAdapter,
})
	// Global Middleware & Plugin
	.use(containerPlugin())
	.use(ipAddressPlugin())
	.use(
		corsPlugin({
			origin: env.APP_ENV === "production" ? PROD_ORIGIN_REGEX : DEV_ORIGIN_REGEX,
			methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
			allowedHeaders: ["content-type", "authorization", CLIENT_PLATFORM_HEADER_NAME],
			credentials: true,
			maxAge: 600,
		}),
	)
	.use(openapiPlugin())

	// Other Routes
	.use(AuthRoutes)
	.use(UsersRoutes)

	// Route
	.get(
		"/",
		async () => {
			return "Hello, mona-ca!";
		},
		{
			detail: pathDetail({
				operationId: "hello",
				summary: "Hello",
				description: "Hello, mona-ca!",
				tag: "Hello",
			}),
		},
	)
	.compile();
