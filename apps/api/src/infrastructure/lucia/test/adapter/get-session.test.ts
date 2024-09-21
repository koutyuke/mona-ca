import { env } from "cloudflare:test";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { beforeAll, describe, expect, test } from "vitest";
import { LuciaAdapter } from "../../lucia.adapter";

const { DB } = env;

describe("Get User Sessions", () => {
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
		const sessions = await luciaAdapter.getUserSessions("userId");

		const schema = t.Object({
			id: t.Literal("sessionId"),
			userId: t.Literal("userId"),
			expiresAt: t.Date(),
			attributes: t.Object({}),
		});

		expect(sessions.length).toBe(1);
		expect(Value.Check(schema, sessions[0])).toBe(true);
	});

	test("間違ったuserIdを指定した場合、空の配列が返る", async () => {
		const sessions = await luciaAdapter.getUserSessions("wrongUserId");
		expect(sessions.length).toBe(0);
	});
});
