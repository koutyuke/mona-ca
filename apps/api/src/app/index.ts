import swagger from "@elysiajs/swagger";
import { cors } from "../modules/cors";
import { ElysiaWithEnv } from "../modules/elysia-with-env";
import type { AppEnv } from "../modules/env";
import { error } from "../modules/error";
import { rateLimiter } from "../modules/rate-limiter";
import { Me } from "./@me";
import { Auth } from "./auth";

const root = new ElysiaWithEnv({
	aot: false,
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
	.use(Me)

	// Route
	.use(
		rateLimiter("login", {
			refillRate: 5,
			maxTokens: 10,
			interval: {
				value: 10,
				unit: "m",
			},
		}),
	)
	.get(
		"/",
		async () => {
			return "Hello, mona-ca!";
		},
		{
			beforeHandle: async ({ ip, rateLimiter, set }) => {
				const { success } = await rateLimiter.consume(ip, 1);
				if (!success) {
					set.status = 429;
					return {
						name: "TooManyRequests",
					};
				}
				return;
			},
		},
	);

export type App = typeof app;

export default {
	fetch: async (request: Request, env: AppEnv) => {
		return root.setEnv(env).fetch(request);
	},
} satisfies ExportedHandler<AppEnv>;
