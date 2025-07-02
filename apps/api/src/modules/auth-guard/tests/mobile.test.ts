import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { SessionSecretService, createSessionToken } from "../../../application/services/session";
import { CLIENT_TYPE_HEADER_NAME } from "../../../common/constants";
import { newSessionId } from "../../../domain/value-object";
import { type DatabaseSession, SessionTableHelper, UserTableHelper } from "../../../tests/helpers";
import { toDatabaseSessionSecretHash } from "../../../tests/utils";
import { ElysiaWithEnv } from "../../elysia-with-env";
import { authGuard } from "../auth-guard.plugin";

const { DB, SESSION_PEPPER } = env;

const sessionSecretService = new SessionSecretService(SESSION_PEPPER);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

const user1Id = "user1Id" as const;
const user2Id = "user2Id" as const;

const session1Id = newSessionId("session1Id");
const session2Id = newSessionId("session2Id");

const sessionSecret1 = "session1Secret" as const;
const sessionSecret2 = "session2Secret" as const;

const sessionSecretHash1 = sessionSecretService.hashSessionSecret(sessionSecret1);
const sessionSecretHash2 = sessionSecretService.hashSessionSecret(sessionSecret2);

const sessionToken1 = createSessionToken(session1Id, sessionSecret1);
const sessionToken2 = createSessionToken(session2Id, sessionSecret2);

const databaseSession1: DatabaseSession = {
	id: session1Id,
	user_id: user1Id,
	secret_hash: toDatabaseSessionSecretHash(sessionSecretHash1),
	expires_at: sessionTableHelper.baseDatabaseSession.expires_at,
};

const databaseSession2: DatabaseSession = {
	id: session2Id,
	user_id: user2Id,
	secret_hash: toDatabaseSessionSecretHash(sessionSecretHash2),
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
					[CLIENT_TYPE_HEADER_NAME]: "mobile",
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
					[CLIENT_TYPE_HEADER_NAME]: "mobile",
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
					[CLIENT_TYPE_HEADER_NAME]: "mobile",
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
					[CLIENT_TYPE_HEADER_NAME]: "mobile",
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
					[CLIENT_TYPE_HEADER_NAME]: "mobile",
				},
			}),
		);

		expect(res.status).toBe(401);
	});
});
