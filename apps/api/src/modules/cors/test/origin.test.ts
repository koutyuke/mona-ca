import { env } from "cloudflare:test";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { describe, expect, test } from "vitest";
import { cors } from "../cors.plugin";

describe("Origin Test", async () => {
	test("falseの時にOriginが設定されない", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(
				cors({
					origin: false,
				}),
			)
			.get("/", () => "Test");

		const res = await app.fetch(new Request("http://localhost/"));

		expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
	});

	test("trueの時に全てのOriginが許可される", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(
				cors({
					origin: true,
				}),
			)
			.get("/", () => "Test");

		const testCases = ["http://localhost", "http://localhost:3000", "https://example.com", "https://mona-ca.com"];

		for (const testCase of testCases) {
			const res = await app.fetch(new Request(testCase, { headers: { Origin: testCase } }));
			expect(res.headers.get("Access-Control-Allow-Origin")).toBe(testCase);
		}
	});

	test("指定したOriginのみ許可される(development)", async () => {
		const testCases: {
			origin: string | RegExp;
			url: string;
			result: string | null;
		}[] = [
			// string
			{
				origin: "http://example.com",
				url: "http://example.com",
				result: "http://example.com",
			},
			{
				origin: "example.com",
				url: "http://example.com",
				result: "http://example.com",
			},
			{
				origin: "api.example.com",
				url: "http://api.example.com",
				result: "http://api.example.com",
			},
			{
				origin: "example.com",
				url: "http://api.example.com",
				result: null,
			},
			{
				origin: "http://example.com",
				url: "http://example.org",
				result: null,
			},
			// RegExp
			{
				origin: /\.com/g,
				url: "http://example.com",
				result: "http://example.com",
			},
			{
				origin: /\.com/g,
				url: "http://example.org",
				result: null,
			},
		];

		for (const testCase of testCases) {
			const app = new ElysiaWithEnv({ aot: false })
				.setEnv({
					...env,
					APP_ENV: "development",
				})
				.use(
					cors({
						origin: app_env => {
							if (app_env === "development") {
								return [testCase.origin];
							}
							return [];
						},
					}),
				)
				.get("/", () => "Test");

			const res = await app.fetch(new Request(testCase.url, { headers: { Origin: testCase.url } }));

			expect(res.headers.get("Access-Control-Allow-Origin")).toBe(testCase.result);
		}
	});

	test("指定したOriginのみ許可される(production)", async () => {
		const testCases: {
			origin: string | RegExp;
			url: string;
			result: string | null;
		}[] = [
			{
				origin: "http://example.com",
				url: "http://example.com",
				result: "http://example.com",
			},
			{
				origin: "http://example.com",
				url: "http://example.org",
				result: null,
			},

			{
				origin: /\.com/g,
				url: "http://example.com",
				result: "http://example.com",
			},
			{
				origin: /\.com/g,
				url: "http://example.org",
				result: null,
			},
		];

		for (const testCase of testCases) {
			const app = new ElysiaWithEnv({ aot: false })
				.setEnv({
					...env,
					APP_ENV: "production",
				})
				.use(
					cors({
						origin: app_env => {
							if (app_env === "production") {
								return [testCase.origin];
							}
							return [];
						},
					}),
				)
				.get("/", () => "Test");

			const res = await app.fetch(new Request(testCase.url, { headers: { Origin: testCase.url } }));

			expect(res.headers.get("Access-Control-Allow-Origin")).toBe(testCase.result);
		}
	});
});
