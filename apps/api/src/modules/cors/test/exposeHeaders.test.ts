import { env } from "cloudflare:test";
import { ElysiaWithEnv } from "@/modules/elysiaWithEnv";
import { describe, expect, test } from "vitest";
import { cors } from "../cors.plugin";

describe("Expose Headers Test", async () => {
	test("falseの時にHeaderが設定されない", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(
				cors({
					exposeHeaders: false,
				}),
			)
			.get("/", () => "Test");

		const res = await app.fetch(new Request("http://localhost/"));

		expect(res.headers.get("Access-Control-Expose-Headers")).toBeNull();
	});

	test("trueの時に全てのHeaderが許可される", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(
				cors({
					exposeHeaders: true,
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

		const accessControlAllowHeaders = res.headers.get("Access-Control-Expose-Headers");

		expect(
			accessControlAllowHeaders?.includes("Content-Type") || accessControlAllowHeaders?.includes("content-type"),
		).toBe(true);

		expect(
			accessControlAllowHeaders?.includes("Authorization") || accessControlAllowHeaders?.includes("authorization"),
		).toBe(true);
	});

	test("指定したHeaderのみ許可される", async () => {
		const app = new ElysiaWithEnv({ aot: false }).setEnv(env).use(
			cors({
				exposeHeaders: ["Content-Type", "Authorization"],
			}),
		);

		const res = await app.fetch(new Request("http://localhost/"));

		const accessControlAllowHeaders = res.headers.get("Access-Control-Expose-Headers");

		expect(accessControlAllowHeaders).toBe("Content-Type, Authorization");
	});
});
