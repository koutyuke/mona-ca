import swagger from "@elysiajs/swagger";
import { cors } from "../modules/cors";
import { ElysiaWithEnv } from "../modules/elysia-with-env";
import type { AppEnv } from "../modules/env";
import { error } from "../modules/error";
import { Auth } from "./auth";
import { Users } from "./users";

const root = new ElysiaWithEnv({
	aot: false,
	strictPath: false,
});

const app = root
	// Global Middleware & Plugin
	.use(
		cors({
			origin: app_env => {
				if (app_env === "production") {
					return ["mona-ca.com"];
				}
				return [/localhost:\d{4}$/];
			},
			allowedHeaders: ["Content-Type", "Authorization"],
		}),
	)
	.use(error)
	.use(
		swagger({
			documentation: {
				info: {
					title: "mona-ca API Documentation",
					version: "0.0.0",
				},
			},
		}),
	)

	// Other Routes
	.use(Auth)
	.use(Users)

	// Route
	.get("/", async () => {
		return "Hello, mona-ca!";
	});

export type App = typeof app;

export default {
	fetch: async (request: Request, env: AppEnv) => {
		return root.setEnv(env).fetch(request);
	},
} satisfies ExportedHandler<AppEnv>;
