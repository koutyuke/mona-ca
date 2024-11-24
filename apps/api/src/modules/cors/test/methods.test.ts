import { env } from "cloudflare:test";
import { describe, expect, test } from "vitest";
import { ElysiaWithEnv } from "../../elysia-with-env";
import { cors } from "../cors.plugin";

describe("Methods Test", async () => {
	test("falseの時にMethodが設定されない", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(
				cors({
					methods: false,
				}),
			)
			.get("/", () => "Test");

		const res = await app.fetch(new Request("http://localhost/"));

		expect(res.headers.get("Access-Control-Allow-Methods")).toBeNull();
	});

	test("trueの時に全てのMethodが許可される", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(
				cors({
					methods: true,
				}),
			)
			.get("/", () => "Test");

		const testCases = ["GET", "POST", "PUT", "DELETE", "PATCH"];

		for (const testCase of testCases) {
			const res = await app.fetch(new Request("http://localhost/", { method: testCase }));
			expect(res.headers.get("Access-Control-Allow-Methods")).toBe(testCase);
		}
	});

	test("指定したMethodのみ許可される", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(
				cors({
					methods: ["GET", "POST"],
				}),
			)
			.get("/", () => "Test");

		const res = await app.fetch(new Request("http://localhost/"));
		expect(res.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST");
	});
});
