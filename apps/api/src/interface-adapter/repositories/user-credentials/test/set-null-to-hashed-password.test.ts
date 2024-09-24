import { env } from "cloudflare:test";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { beforeAll, describe, expect, test } from "vitest";
import { UserCredentialsRepository } from "../user-credentials.repository";

const { DB } = env;

describe("Set Null To Hashed Password", () => {
	const userCredentialsRepository = new UserCredentialsRepository({
		db: DB,
	});

	beforeAll(async () => {
		await DB.prepare(
			"INSERT INTO users (id, name, email, email_verified, icon_url, hashed_password, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
		)
			.bind("userId", "foo", "user@mail.com", 0, null, "hashedPassword", Date.now(), Date.now())
			.run();
	});

	test("DBにデータが更新されている", async () => {
		await userCredentialsRepository.setNullToHashedPassword("userId");

		const { results } = await DB.prepare("SELECT * FROM users WHERE id = ?1").bind("userId").all();

		const schema = t.Object({
			id: t.Literal("userId"),
			name: t.Literal("foo"),
			email: t.Literal("user@mail.com"),
			email_verified: t.Literal(0),
			icon_url: t.Null(),
			hashed_password: t.Null(),
			gender: t.Literal("man"),
			created_at: t.Number(),
			updated_at: t.Number(),
		});

		expect(results.length === 1 && Value.Check(schema, results[0])).toBe(true);
	});
});
