import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { SessionTableHelper, UserTableHelper } from "../../../tests/helpers";
import { ElysiaWithEnv } from "../../elysia-with-env";
import { authGuard } from "../auth-guard.plugin";

const { DB } = env;

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

const sessionToken1 = "sessionId1" as const;
const sessionToken2 = "sessionId2" as const;

describe("AuthGuard Authorization Header Test", () => {
	beforeAll(async () => {
		await userTableHelper.create({
			...userTableHelper.baseDatabaseUser,
			id: "user1Id",
			email_verified: 0,
			email: "test1.email@example.com",
		});

		await userTableHelper.create({
			...userTableHelper.baseDatabaseUser,
			id: "user2Id",
			email_verified: 1,
			email: "test2.email@example.com",
		});

		await sessionTableHelper.create({
			sessionToken: sessionToken1,
			session: {
				user_id: "user1Id",
			},
		});

		await sessionTableHelper.create({
			sessionToken: sessionToken2,
			session: {
				user_id: "user2Id",
			},
		});
	});

	test("Pass with valid authorization header that email verification is not required", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ requireEmailVerification: false }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					authorization: `Bearer ${sessionToken1}`,
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
			.use(authGuard({ requireEmailVerification: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					authorization: `Bearer ${sessionToken2}`,
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
			.use(authGuard({ requireEmailVerification: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					authorization: `Bearer ${sessionToken1}`,
				},
			}),
		);

		expect(res.status).toBe(401);
	});

	test("Fail with invalid authorization header that email verification is not required", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ requireEmailVerification: false }))
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
			.use(authGuard({ requireEmailVerification: true }))
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
