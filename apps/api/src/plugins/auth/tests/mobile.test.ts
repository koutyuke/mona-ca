import { env } from "cloudflare:test";
import { Elysia } from "elysia";
import { beforeEach, describe, expect, test } from "vitest";
import { SessionSecretHasher } from "../../../core/infra/crypto";
import { CLIENT_TYPE_HEADER_NAME } from "../../../core/lib/http";
import { SessionTableHelper, UserTableHelper } from "../../../core/testing/helpers";
import { createAuthUserFixture, createSessionFixture } from "../../../features/auth/testing/fixtures";
import { convertSessionToRaw, convertUserRegistrationToRaw } from "../../../features/auth/testing/helpers";
import { containerPlugin } from "../../container";
import { authPlugin } from "../auth.plugin";

const { DB } = env;

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);
const sessionSecretHasher = new SessionSecretHasher();

const { userRegistration: user1 } = createAuthUserFixture({
	userRegistration: {
		email: "test1.email@example.com",
		emailVerified: false,
	},
});

const { userRegistration: user2 } = createAuthUserFixture({
	userRegistration: {
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

describe("AuthPlugin Mobile Authorization Header Test", () => {
	beforeEach(async () => {
		sessionTableHelper.deleteAll();
		userTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(user1));
		await userTableHelper.save(convertUserRegistrationToRaw(user2));

		await sessionTableHelper.save(convertSessionToRaw(session1));
		await sessionTableHelper.save(convertSessionToRaw(session2));
	});

	test("Pass with valid authorization header that email verification is not required", async () => {
		const app = new Elysia({ aot: false })
			.use(containerPlugin())
			.use(authPlugin({ requireEmailVerification: false }))
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
		const app = new Elysia({ aot: false })
			.use(containerPlugin())
			.use(authPlugin({ requireEmailVerification: true }))
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
		const app = new Elysia({ aot: false })
			.use(containerPlugin())
			.use(authPlugin({ requireEmailVerification: true }))
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
		const app = new Elysia({ aot: false })
			.use(containerPlugin())
			.use(authPlugin({ requireEmailVerification: false }))
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
		const app = new Elysia({ aot: false })
			.use(containerPlugin())
			.use(authPlugin({ requireEmailVerification: true }))
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
