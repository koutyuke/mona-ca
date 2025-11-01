import { env } from "cloudflare:test";
import { Elysia } from "elysia";
import { beforeEach, describe, expect, test } from "vitest";
import { SessionSecretHasher } from "../../../core/infra/crypto";
import { CLIENT_TYPE_HEADER_NAME, SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { SessionTableHelper, UserTableHelper } from "../../../core/testing/helpers";
import { sessionRefreshSpan } from "../../../features/auth/domain/entities/session";
import { createAuthUserFixture, createSessionFixture } from "../../../features/auth/testing/fixtures";
import { convertSessionToRaw, convertUserRegistrationToRaw } from "../../../features/auth/testing/helpers";
import { containerPlugin } from "../../container";
import { authPlugin } from "../auth.plugin";

const { DB } = env;

const sessionTokenRefreshExpires = new Date(Date.now() + sessionRefreshSpan.milliseconds() / 2 - 1000);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);
const sessionSecretHasher = new SessionSecretHasher();

const { userRegistration } = createAuthUserFixture({
	userRegistration: {
		email: "test1.email@example.com",
	},
});

const { session, sessionToken } = createSessionFixture({
	secretHasher: sessionSecretHasher.hash,
	session: {
		userId: userRegistration.id,
		expiresAt: sessionTokenRefreshExpires,
	},
});

describe("AuthPlugin enableSessionCookieRefresh option", () => {
	beforeEach(async () => {
		sessionTableHelper.deleteAll();
		userTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
		await sessionTableHelper.save(convertSessionToRaw(session));
	});

	test("should refresh the session token", async () => {
		const app = new Elysia({ aot: false })
			.use(containerPlugin())
			.use(authPlugin({ enableSessionCookieRefresh: true }))
			.get("/", () => {
				return "Test";
			});

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					cookie: `${SESSION_COOKIE_NAME}=${sessionToken};`,
					[CLIENT_TYPE_HEADER_NAME]: "web",
				},
			}),
		);

		const cookieString = res.headers.get("set-cookie");
		const cookieAttributes = cookieString?.split(";").map(x => x.trim().split("="));

		const cookieExpires = cookieAttributes?.find(([key]) => key === "Expires")?.[1];

		if (!cookieExpires) {
			throw new Error("Cookie expires not found");
		}

		expect(new Date(cookieExpires!).getTime()).toBeGreaterThan(sessionTokenRefreshExpires.getTime());
	});
});
