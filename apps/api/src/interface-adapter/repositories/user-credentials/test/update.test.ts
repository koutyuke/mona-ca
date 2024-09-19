import { env } from "cloudflare:test";
import { UserCredentialsSchema } from "@/domain/user-credentials";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { beforeAll, describe, expect, test } from "vitest";
import { UserCredentialsRepository } from "../user-credentials.repository";

const { DB } = env;

describe("Update UserCredentials", () => {
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

	test("返り値がSchema通りである(UserCredentialsSchema)", async () => {
		const updatedUserCredentials = await userCredentialsRepository.update("userId", {
			hashedPassword: "hashedPasswordUpdated",
		});

		const isValid = Value.Check(UserCredentialsSchema, updatedUserCredentials);

		expect(isValid).toBe(true);
	});

	test("返り値が期待通りである", async () => {
		const userCredentials = await userCredentialsRepository.update("userId", {
			hashedPassword: "hashedPasswordUpdated",
		});

		const schema = t.Object({
			userId: t.Literal("userId"),
			hashedPassword: t.Literal("hashedPasswordUpdated"),
		});

		const isValid = Value.Check(schema, userCredentials);

		expect(isValid).toBe(true);
	});

	test("DBにデータが更新されている", async () => {
		await userCredentialsRepository.update("userId", {
			hashedPassword: "hashedPasswordUpdated",
		});

		const { results } = await DB.prepare("SELECT * FROM users WHERE id = ?1").bind("userId").all();

		const schema = t.Object({
			id: t.Literal("userId"),
			name: t.Literal("foo"),
			email: t.Literal("user@mail.com"),
			email_verified: t.Literal(0),
			icon_url: t.Null(),
			hashed_password: t.Literal("hashedPasswordUpdated"),
			created_at: t.Number(),
			updated_at: t.Number(),
		});

		expect(results.length === 1 && Value.Check(schema, results[0])).toBe(true);
	});
});
