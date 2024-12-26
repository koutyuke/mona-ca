import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { SESSION_COOKIE_NAME } from "../../../common/constants";
import { SessionTableHelper, UserTableHelper } from "../../../tests/helpers";
import { ElysiaWithEnv } from "../../elysia-with-env";
import { authGuard } from "../auth-guard.plugin";

const { DB } = env;

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

describe("AuthGuard includeSessionToken option", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await sessionTableHelper.create();
	});

	test("should include session token in the context object", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ includeSessionToken: true }))
			.get("/", context => {
				expect(context).toHaveProperty("sessionToken");
				return "Test";
			});

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					cookie: `${SESSION_COOKIE_NAME}=${sessionTableHelper.baseSessionToken};`,
				},
			}),
		);

		expect(res.status).toBe(200);
	});

	test("should not include session token in the context object", async () => {
		const app = new ElysiaWithEnv({ aot: false })
			.setEnv(env)
			.use(authGuard({ includeSessionToken: false }))
			.get("/", context => {
				expect(context).not.toHaveProperty("sessionToken");

				return context;
			});

		const res = await app.fetch(
			new Request("http://localhost/", {
				headers: {
					cookie: `${SESSION_COOKIE_NAME}=${sessionTableHelper.baseSessionToken};`,
				},
			}),
		);

		expect(res.status).toBe(200);
	});
});
