import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { CLIENT_TYPE_HEADER_NAME, SESSION_COOKIE_NAME, sessionRefreshSpan } from "../../../common/constants";
import { SessionTableHelper, UserTableHelper } from "../../../tests/helpers";
import { ElysiaWithEnv } from "../../elysia-with-env";
import { authGuard } from "../auth-guard.plugin";

const { DB } = env;

const sessionTokenRefreshExpires = new Date(Date.now() + sessionRefreshSpan.milliseconds() / 2 - 1000);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB, {
	expiresAt: sessionTokenRefreshExpires,
});

describe("AuthGuard enableSessionCookieRefresh option", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await sessionTableHelper.create();
	});

	test("should refresh the session token", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ enableSessionCookieRefresh: true }))
			.get("/", () => {
				return "Test";
			});

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					cookie: `${SESSION_COOKIE_NAME}=${sessionTableHelper.baseToken};`,
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
