import { env } from "cloudflare:test";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { beforeAll, describe, expect, test } from "vitest";
import { LuciaAdapter } from "../../lucia.adapter";

const { DB } = env;

describe("Set Session", () => {
	let luciaAdapter: LuciaAdapter;

	beforeAll(async () => {
		luciaAdapter = new LuciaAdapter({ db: DB });

		await DB.prepare(
			"INSERT INTO users (id, name, email, email_verified, icon_url, hashed_password, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
		)
			.bind("userId", "foo", "user@mail.com", 0, null, "hashedPassword", Date.now(), Date.now())
			.run();
	});

	test("セッションが正常にセットされる", async () => {
		await luciaAdapter.setSession({
			id: "sessionId",
			userId: "userId",
			expiresAt: new Date(),
			attributes: {},
		});

		const { results } = await DB.prepare("SELECT * FROM session WHERE id = ?1").bind("sessionId").all();

		const schema = t.Object({
			id: t.Literal("sessionId"),
			user_id: t.Literal("userId"),
			expires_at: t.Number(),
		});

		expect(results.length === 1 && Value.Check(schema, results[0])).toBe(true);
	});
});
