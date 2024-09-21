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
			.bind("userId1", "foo", "user1@mail.com", 0, null, "hashedPassword", Date.now(), Date.now())
			.run();

		await DB.prepare(
			"INSERT INTO users (id, name, email, email_verified, icon_url, hashed_password, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
		)
			.bind("userId2", "foo", "user2@mail.com", 1, null, "hashedPassword", Date.now(), Date.now())
			.run();

		await DB.prepare("INSERT INTO session (id, user_id, expires_at) VALUES (?1, ?2, ?3)")
			.bind("sessionId1", "userId1", Date.now())
			.run();

		await DB.prepare("INSERT INTO session (id, user_id, expires_at) VALUES (?1, ?2, ?3)")
			.bind("sessionId2", "userId2", Date.now())
			.run();
	});

	test("Pass with valid authorization header that email verification is not required", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ emailVerificationRequired: false }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					authorization: "Bearer sessionId1",
				},
			}),
		);
		const text = await res.text();

		expect(res.status).toBe(200);
		expect(text).toBe("Test");
	});

	test("Pass with valid authorization header that email verification is required", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ emailVerificationRequired: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					authorization: "Bearer sessionId2",
				},
			}),
		);
		const text = await res.text();

		expect(res.status).toBe(200);
		expect(text).toBe("Test");
	});

	test("Fail with not email verified yet", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ emailVerificationRequired: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					authorization: "Bearer sessionId1",
				},
			}),
		);

		expect(res.status).toBe(401);
	});

	test("Fail with invalid authorization header that email verification is not required", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ emailVerificationRequired: false }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					authorization: "Bearer invalidSessionId1",
				},
			}),
		);

		expect(res.status).toBe(401);
	});

	test("Fail with invalid authorization header that email verification is not required", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ emailVerificationRequired: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					authorization: "Bearer invalidSessionId2",
				},
			}),
		);

		expect(res.status).toBe(401);
	});
});
