import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { CLIENT_TYPE_HEADER_NAME } from "../../../common/constants";
import { SessionSecretHasher } from "../../../infrastructure/crypt";
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

describe("AuthGuard Authorization Header Test", () => {
	beforeEach(async () => {
		sessionTableHelper.deleteAll();
		userTableHelper.deleteAll();

		await userTableHelper.save(user1, null);
		await userTableHelper.save(user2, null);

		await sessionTableHelper.save(session1);
		await sessionTableHelper.save(session2);
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
