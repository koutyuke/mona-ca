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

		expect(res.headers.get("access-control-allow-headers")).toBeNull();
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
					"content-type": "application/json",
					authorization: "Bearer token",
				},
			}),
		);

		const accessControlAllowHeaders = res.headers.get("access-control-allow-headers");

		expect(
			accessControlAllowHeaders?.includes("content-type") || accessControlAllowHeaders?.includes("Content-Type"),
		).toBe(true);

		expect(
			accessControlAllowHeaders?.includes("authorization") || accessControlAllowHeaders?.includes("Authorization"),
		).toBe(true);
	});

	test("指定したHeaderのみ許可される", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(
				cors({
					allowedHeaders: ["content-type", "authorization"],
				}),
			)
			.get("/", () => "Test");

		const res = await app.fetch(new Request("http://localhost/"));

		const accessControlAllowHeaders = res.headers.get("access-control-allow-headers");

		expect(accessControlAllowHeaders).toBe("content-type, authorization");
	});
});
