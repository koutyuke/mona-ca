import { env } from "cloudflare:test";
import { SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia } from "elysia";
import { assert, afterEach, beforeEach, describe, expect, test } from "vitest";
import { TokenSecretService } from "../../../core/infra/crypto";
import { SessionsTableDriver, UsersTableDriver } from "../../../core/testing/drivers";
import { sessionRefreshSpan } from "../../../features/auth/domain/entities/session";
import { convertSessionToRaw, convertUserRegistrationToRaw } from "../../../features/auth/testing/converters";
import { createAuthUserFixture, createSessionFixture } from "../../../features/auth/testing/fixtures";
import { containerPlugin } from "../../container";
import { authPlugin } from "../auth.plugin";

const { DB } = env;

const sessionTokenRefreshExpires = new Date(Date.now() + sessionRefreshSpan.milliseconds() / 2 - 1000);

const userTableDriver = new UsersTableDriver(DB);
const sessionTableDriver = new SessionsTableDriver(DB);
const tokenSecretService = new TokenSecretService();

const { userRegistration } = createAuthUserFixture();

const { session, sessionToken } = createSessionFixture({
	secretHasher: tokenSecretService.hash,
	session: {
		userId: userRegistration.id,
		expiresAt: sessionTokenRefreshExpires,
	},
});

describe("AuthPlugin Session Cookie Refresh Test", () => {
	beforeEach(async () => {
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
		await sessionTableDriver.save(convertSessionToRaw(session));
	});

	afterEach(async () => {
		await sessionTableDriver.deleteAll();
		await userTableDriver.deleteAll();
	});

	test("Success: should refresh the session token", async () => {
		const app = new Elysia({ aot: false, normalize: false })
			.use(containerPlugin())
			.use(authPlugin())
			.get("/", () => {
				return "Test";
			});

		const res = await app.handle(
			new Request("http://localhost/", {
				headers: {
					cookie: `${SESSION_COOKIE_NAME}=${sessionToken};`,
				},
			}),
		);

		expect(res.status).toBe(200);

		const cookieString = res.headers.get("set-cookie");
		const cookieAttributes = cookieString?.split(";").map(x => x.trim().split("="));

		const cookieExpires = cookieAttributes?.find(([key]) => key === "Expires")?.[1];

		assert(cookieExpires, "Cookie expires not found");

		expect(new Date(cookieExpires).getTime()).toBeGreaterThan(sessionTokenRefreshExpires.getTime());
	});
});
