import { env } from "cloudflare:test";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { beforeAll, describe, expect, test } from "vitest";
import { LuciaAdapter } from "../../lucia.adapter";

const { DB } = env;

describe("Get Session And User", () => {
	let luciaAdapter: LuciaAdapter;

	beforeAll(async () => {
		luciaAdapter = new LuciaAdapter({ db: DB });

		await DB.prepare(
			"INSERT INTO users (id, name, email, email_verified, icon_url, hashed_password, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
		)
			.bind("userId", "foo", "user@mail.com", 0, null, "hashedPassword", Date.now(), Date.now())
			.run();

		await DB.prepare("INSERT INTO session (id, user_id, expires_at) VALUES (?1, ?2, ?3)")
			.bind("sessionId", "userId", Date.now())
			.run();
	});

	test("返り値が期待通りである", async () => {
		const [session, user] = await luciaAdapter.getSessionAndUser("sessionId");

		const sessionSchema = t.Object({
			id: t.Literal("sessionId"),
			userId: t.Literal("userId"),
			expiresAt: t.Date(),
			attributes: t.Object({}),
		});

		const userSchema = t.Object({
			id: t.Literal("userId"),
			attributes: t.Object({
				email: t.Literal("user@mail.com"),
				emailVerified: t.Literal(false),
				name: t.Literal("foo"),
				iconUrl: t.Null(),
				hashedPassword: t.Literal("hashedPassword"),
				createdAt: t.Date(),
				updatedAt: t.Date(),
			}),
		});

		expect(Value.Check(sessionSchema, session)).toBe(true);
		expect(Value.Check(userSchema, user)).toBe(true);
	});

	test("間違ったsessionIdを指定した場合、nullが返る", async () => {
		const [session, user] = await luciaAdapter.getSessionAndUser("wrongSessionId");
		expect(session).toBe(null);
		expect(user).toBe(null);
	});
});
