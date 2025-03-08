import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { SessionTokenService } from "../../../application/services/session-token";
import { type DatabaseSession, SessionTableHelper, UserTableHelper } from "../../../tests/helpers";
import { ElysiaWithEnv } from "../../elysia-with-env";
import { authGuard } from "../auth-guard.plugin";

const { DB, SESSION_PEPPER } = env;

const sessionTokenService = new SessionTokenService(SESSION_PEPPER);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

const user1Id = "user1Id" as const;
const user2Id = "user2Id" as const;

const sessionToken1 = "sessionId1" as const;
const sessionToken2 = "sessionId2" as const;

const session1Id = sessionTokenService.hashSessionToken(sessionToken1);
const session2Id = sessionTokenService.hashSessionToken(sessionToken2);

const databaseSession1: DatabaseSession = {
	id: session1Id,
	user_id: user1Id,
	expires_at: sessionTableHelper.baseDatabaseSession.expires_at,
};

const databaseSession2: DatabaseSession = {
	id: session2Id,
	user_id: user2Id,
	expires_at: sessionTableHelper.baseDatabaseSession.expires_at,
};

describe("AuthGuard Authorization Header Test", () => {
	beforeAll(async () => {
		// Create Active User
		await userTableHelper.create({
			...userTableHelper.baseDatabaseUser,
			id: "user1Id",
			email_verified: 0,
			email: "test1.email@example.com",
		});

		// Create non-Active User
		await userTableHelper.create({
			...userTableHelper.baseDatabaseUser,
			id: "user2Id",
			email_verified: 1,
			email: "test2.email@example.com",
		});

		await sessionTableHelper.create(databaseSession1);

		await sessionTableHelper.create(databaseSession2);
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
