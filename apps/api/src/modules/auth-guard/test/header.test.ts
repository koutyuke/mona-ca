import { env } from "cloudflare:test";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { beforeAll, describe, expect, test } from "vitest";
import { authGuard } from "../auth-guard.plugin";

const { DB } = env;

describe("AuthGuard Authorization Header Test", () => {
	beforeAll(async () => {
		await DB.prepare(
			"INSERT INTO users (id, name, email, email_verified, icon_url, hashed_password, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
		)
			.bind("userId", "foo", "user@mail.com", 0, null, "hashedPassword", Date.now(), Date.now())
			.run();

		await DB.prepare("INSERT INTO session (id, user_id, expires_at) VALUES (?1, ?2, ?3)")
			.bind("sessionId", "userId", Date.now())
			.run();
	});

	test("Pass with valid authorization header", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard)
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					authorization: "Bearer sessionId",
				},
			}),
		);

		expect(res.status).toBe(200);
	});

	test("Fail with invalid authorization header", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard)
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					authorization: "Bearer invalidSessionId",
				},
			}),
		);

		expect(res.status).toBe(401);
	});
});
