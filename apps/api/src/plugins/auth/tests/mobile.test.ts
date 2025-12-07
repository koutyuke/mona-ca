import { env } from "cloudflare:test";
import { AUTHORIZATION_HEADER_NAME, CLIENT_PLATFORM_HEADER_NAME } from "@mona-ca/core/http";
import { Elysia } from "elysia";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { TokenSecretService } from "../../../core/infra/crypto";
import { SessionsTableDriver, UsersTableDriver } from "../../../core/testing/drivers";
import { convertSessionToRaw, convertUserRegistrationToRaw } from "../../../features/auth/testing/converters";
import { createAuthUserFixture, createSessionFixture } from "../../../features/auth/testing/fixtures";
import { containerPlugin } from "../../container";
import { authPlugin } from "../auth.plugin";

const { DB } = env;

const userTableDriver = new UsersTableDriver(DB);
const sessionTableDriver = new SessionsTableDriver(DB);
const tokenSecretService = new TokenSecretService();

const withBearer = (token: string) => {
	return `Bearer ${token}`;
};

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

describe("AuthPlugin Mobile Authorization Header Test", () => {
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

	test("Pass with valid authorization header that email verification is not required", async () => {
		const app = new Elysia({ aot: false })
			.use(containerPlugin())
			.use(authPlugin({ withEmailVerification: false }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					[CLIENT_PLATFORM_HEADER_NAME]: "mobile",
					[AUTHORIZATION_HEADER_NAME]: withBearer(sessionToken1),
				},
			}),
		);
		const text = await res.text();

		expect(res.status).toBe(200);
		expect(text).toBe("Test");
	});

	test("Pass with valid authorization header that email verification is required", async () => {
		const app = new Elysia({ aot: false, normalize: false })
			.use(containerPlugin())
			.use(authPlugin({ withEmailVerification: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					[AUTHORIZATION_HEADER_NAME]: withBearer(sessionToken2),
					[CLIENT_PLATFORM_HEADER_NAME]: "mobile",
				},
			}),
		);
		const text = await res.text();

		expect(res.status).toBe(200);
		expect(text).toBe("Test");
	});

	test("Fail with not email verified yet", async () => {
		const app = new Elysia({ aot: false, normalize: false })
			.use(containerPlugin())
			.use(authPlugin({ withEmailVerification: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					[AUTHORIZATION_HEADER_NAME]: withBearer(sessionToken1),
					[CLIENT_PLATFORM_HEADER_NAME]: "mobile",
				},
			}),
		);

		expect(res.status).toBe(401);
	});

	test("Fail with invalid authorization header that email verification is not required", async () => {
		const app = new Elysia({ aot: false, normalize: false })
			.use(containerPlugin())
			.use(authPlugin({ withEmailVerification: false }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					[AUTHORIZATION_HEADER_NAME]: withBearer("invalidSessionId1"),
					[CLIENT_PLATFORM_HEADER_NAME]: "mobile",
				},
			}),
		);

		expect(res.status).toBe(401);
	});

	test("Fail with invalid authorization header that email verification is not required", async () => {
		const app = new Elysia({ aot: false, normalize: false })
			.use(containerPlugin())
			.use(authPlugin({ withEmailVerification: true }))
			.get("/", () => "Test");

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					[AUTHORIZATION_HEADER_NAME]: withBearer("invalidSessionId2"),
					[CLIENT_PLATFORM_HEADER_NAME]: "mobile",
				},
			}),
		);

		expect(res.status).toBe(401);
	});
});
