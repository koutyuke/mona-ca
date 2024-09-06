import { env } from "cloudflare:test";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { describe, expect, test } from "vitest";
import { cors } from "../cors.plugin";

describe("Allowed Header Test", () => {
	test("falseの時にHeaderが設定されない", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(
				cors({
					allowedHeaders: false,
				}),
			)
			.get("/", () => "Test");

		const res = await app.fetch(new Request("http://localhost/"));

		expect(res.headers.get("Access-Control-Allow-Headers")).toBeNull();
	});

	test("trueの時に全てのHeaderが許可される", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(
				cors({
					allowedHeaders: true,
				}),
			)
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer token",
				},
			}),
		);

		const accessControlAllowHeaders = res.headers.get("Access-Control-Allow-Headers");

		expect(
			accessControlAllowHeaders?.includes("Content-Type") || accessControlAllowHeaders?.includes("content-type"),
		).toBe(true);

		expect(
			accessControlAllowHeaders?.includes("Authorization") || accessControlAllowHeaders?.includes("authorization"),
		).toBe(true);
	});

	test("指定したHeaderのみ許可される", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(
				cors({
					allowedHeaders: ["Content-Type", "Authorization"],
				}),
			)
			.get("/", () => "Test");

		const res = await app.fetch(new Request("http://localhost/"));

		const accessControlAllowHeaders = res.headers.get("Access-Control-Allow-Headers");

		expect(accessControlAllowHeaders).toBe("Content-Type, Authorization");
	});
});
