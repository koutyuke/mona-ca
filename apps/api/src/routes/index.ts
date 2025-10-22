import { Elysia } from "elysia";
import { PRODUCTION_BASE_DOMAIN } from "../core/lib/http";
import { cors } from "../plugins/cors";
import { di } from "../plugins/di";
import { error } from "../plugins/error";
import { openAPI } from "../plugins/open-api";
import { pathDetail } from "../plugins/open-api";
import { Auth } from "./auth";
import { Me } from "./me";

globalThis.Buffer = Buffer;

const app = new Elysia({
	aot: false,
	strictPath: false,
})
	// Global Middleware & Plugin
	.use(di())
	.use(
		cors({
			origin: app_env => {
				if (app_env === "production") {
					return [PRODUCTION_BASE_DOMAIN];
				}
				return [/localhost:\d{4}$/];
			},
			allowedHeaders: ["content-type", "authorization", "cf-connecting-ip", "mc-client-type"],
		}),
	)
	.use(error)
	.use(openAPI)

	// Other Routes
	.use(Auth)
	.use(Me)

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
	);

export default app;
