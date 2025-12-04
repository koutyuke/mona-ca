import { env } from "cloudflare:test";
import { Elysia } from "elysia";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { TokenSecretService } from "../../../core/infra/crypto";
import { SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { SessionsTableDriver, UsersTableDriver } from "../../../core/testing/drivers";
import { convertSessionToRaw, convertUserRegistrationToRaw } from "../../../features/auth/testing/converters";
import { createAuthUserFixture, createSessionFixture } from "../../../features/auth/testing/fixtures";
import { containerPlugin } from "../../container";
import { authPlugin } from "../auth.plugin";

const { DB } = env;

const userTableDriver = new UsersTableDriver(DB);
const sessionTableDriver = new SessionsTableDriver(DB);
const tokenSecretService = new TokenSecretService();

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
	secretHasher: tokenSecretService.hash,
	session: {
		userId: user1.id,
	},
});
const { session: session2, sessionToken: sessionToken2 } = createSessionFixture({
	secretHasher: tokenSecretService.hash,
	session: {
		userId: user2.id,
	},
});

describe("AuthPlugin Cookie Test", () => {
	beforeEach(async () => {
		await userTableDriver.save(convertUserRegistrationToRaw(user1));
		await userTableDriver.save(convertUserRegistrationToRaw(user2));

		await sessionTableDriver.save(convertSessionToRaw(session1));
		await sessionTableDriver.save(convertSessionToRaw(session2));
	});

	afterEach(async () => {
		await sessionTableDriver.deleteAll();
		await userTableDriver.deleteAll();
	});

	test("Success: pass with valid cookie that email verification is not required", async () => {
		const app = new Elysia({ aot: false, normalize: false })
			.use(containerPlugin())
			.use(authPlugin({ withEmailVerification: false }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					cookie: `${SESSION_COOKIE_NAME}=${sessionToken1};`,
				},
			}),
		);

		const text = await res.text();

		expect(res.status).toBe(200);
		expect(text).toBe("Test");
	});

	test("Pass with valid cookie that email verification is required", async () => {
		const app = new Elysia({ aot: false, normalize: false })
			.use(containerPlugin())
			.use(authPlugin({ withEmailVerification: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					cookie: `${SESSION_COOKIE_NAME}=${sessionToken2};`,
				},
			}),
		);

		const text = await res.text();

		expect(text).toBe("Test");
		expect(res.status).toBe(200);
	});

	test("Fail with not email verified yet", async () => {
		const app = new Elysia({ aot: false, normalize: false })
			.use(containerPlugin())
			.use(authPlugin({ withEmailVerification: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					cookie: `${SESSION_COOKIE_NAME}=${sessionToken1};`,
				},
			}),
		);

		expect(res.status).toBe(401);
	});

	test("Fail with invalid cookie that email verification is not required", async () => {
		const app = new Elysia({ aot: false, normalize: false })
			.use(containerPlugin())
			.use(authPlugin({ withEmailVerification: false }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					cookie: `${SESSION_COOKIE_NAME}=invalidSessionId1;`,
				},
			}),
		);

		expect(res.status).toBe(401);
	});

	test("Fail with invalid cookie that email verification is required", async () => {
		const app = new Elysia({ aot: false, normalize: false })
			.use(containerPlugin())
			.use(authPlugin({ withEmailVerification: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					cookie: `${SESSION_COOKIE_NAME}=invalidSessionId2;`,
				},
			}),
		);

		expect(res.status).toBe(401);
	});
});
