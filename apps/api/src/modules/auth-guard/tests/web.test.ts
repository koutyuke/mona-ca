import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { CLIENT_TYPE_HEADER_NAME, SESSION_COOKIE_NAME } from "../../../common/constants";
import { SessionSecretHasher } from "../../../infrastructure/crypto";
import { createSessionFixture, createUserFixture } from "../../../tests/fixtures";
import { SessionTableHelper, UserTableHelper } from "../../../tests/helpers";
import { ElysiaWithEnv } from "../../elysia-with-env";
import { authGuard } from "../auth-guard.plugin";

const { DB } = env;

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);
const sessionSecretHasher = new SessionSecretHasher();

const { user: user1 } = createUserFixture({
	user: {
		email: "test1.email@example.com",
		emailVerified: false,
	},
});
const { user: user2 } = createUserFixture({
	user: {
		email: "test2.email@example.com",
		emailVerified: true,
	},
});

const { session: session1, sessionToken: sessionToken1 } = createSessionFixture({
	secretHasher: sessionSecretHasher.hash,
	session: {
		userId: user1.id,
	},
});
const { session: session2, sessionToken: sessionToken2 } = createSessionFixture({
	secretHasher: sessionSecretHasher.hash,
	session: {
		userId: user2.id,
	},
});

describe("AuthGuard cookie test", () => {
	beforeEach(async () => {
		sessionTableHelper.deleteAll();
		userTableHelper.deleteAll();

		await userTableHelper.save(user1, null);
		await userTableHelper.save(user2, null);

		await sessionTableHelper.save(session1);
		await sessionTableHelper.save(session2);
	});

	test("Pass with valid cookie that email verification is not required", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ requireEmailVerification: false }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					cookie: `${SESSION_COOKIE_NAME}=${sessionToken1};`,
					[CLIENT_TYPE_HEADER_NAME]: "web",
				},
			}),
		);

		const text = await res.text();

		expect(res.status).toBe(200);
		expect(text).toBe("Test");
	});

	test("Pass with valid cookie that email verification is required", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ requireEmailVerification: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					cookie: `${SESSION_COOKIE_NAME}=${sessionToken2};`,
					[CLIENT_TYPE_HEADER_NAME]: "web",
				},
			}),
		);

		const text = await res.text();

		expect(text).toBe("Test");
		expect(res.status).toBe(200);
	});

	test("Fail with not email verified yet", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ requireEmailVerification: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					cookie: `${SESSION_COOKIE_NAME}=${sessionToken1};`,
					[CLIENT_TYPE_HEADER_NAME]: "web",
				},
			}),
		);

		expect(res.status).toBe(401);
	});

	test("Fail with invalid cookie that email verification is not required", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ requireEmailVerification: false }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					cookie: `${SESSION_COOKIE_NAME}=invalidSessionId1;`,
					[CLIENT_TYPE_HEADER_NAME]: "web",
				},
			}),
		);

		expect(res.status).toBe(401);
	});

	test("Fail with invalid cookie that email verification is required", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ requireEmailVerification: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					cookie: `${SESSION_COOKIE_NAME}=invalidSessionId2;`,
					[CLIENT_TYPE_HEADER_NAME]: "web",
				},
			}),
		);

		expect(res.status).toBe(401);
	});
});
