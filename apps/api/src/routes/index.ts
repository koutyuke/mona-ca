import { cors } from "../modules/cors";
import { ElysiaWithEnv } from "../modules/elysia-with-env";
import { error } from "../modules/error";
import { openAPI } from "../modules/open-api";
import { pathDetail } from "../modules/open-api";
import { Auth } from "./auth";
import { Me } from "./me";

export const root = new ElysiaWithEnv({
	aot: false,
	strictPath: false,
});

export const app = root
	// Global Middleware & Plugin
	.use(
		cors({
			origin: app_env => {
				if (app_env === "production") {
					return ["mona-ca.com"];
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
