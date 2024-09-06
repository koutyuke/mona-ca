import { env } from "cloudflare:test";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { describe, expect, test } from "vitest";
import { cors } from "../cors.plugin";

describe("Credential Test", async () => {
	test("falseの時にCredentialが設定されない", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(
				cors({
					credentials: false,
				}),
			)
			.get("/", () => "Test");

		const res = await app.fetch(new Request("http://localhost/"));

		expect(res.headers.get("Access-Control-Allow-Credentials")).toBeNull();
	});

	test("trueの時に全てのCredentialが許可される", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(
				cors({
					credentials: true,
				}),
			)
			.get("/", () => "Test");

		const res = await app.fetch(new Request("http://localhost/", { headers: { Origin: "http://localhost" } }));

		expect(res.headers.get("Access-Control-Allow-Credentials")).toBe("true");
	});
});
