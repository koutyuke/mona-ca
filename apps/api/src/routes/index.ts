import { cors as corsPlugin } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { env } from "../core/infra/config/env";
import { CLIENT_TYPE_HEADER_NAME, DEV_ORIGIN_REGEX, PROD_ORIGIN_REGEX } from "../core/lib/http";
import { containerPlugin } from "../plugins/container";
import { ipAddressPlugin } from "../plugins/ip-address";
import { openapiPlugin } from "../plugins/openapi";
import { pathDetail } from "../plugins/openapi";
import { AuthRoutes } from "./auth";
import { MeRoutes } from "./me";

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
			allowedHeaders: ["content-type", "authorization", CLIENT_TYPE_HEADER_NAME],
			credentials: true,
			maxAge: 600,
		}),
	)
	.use(openapiPlugin())

	// Other Routes
	.use(AuthRoutes)
	.use(MeRoutes)

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
