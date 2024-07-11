import { env } from "cloudflare:test";
import { UserSchema } from "@/domain/user";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { beforeAll, describe, expect, test } from "vitest";
import { UserRepository } from "../user.repository";

const { DB } = env;

describe("Update User", async () => {
	const userRepository = new UserRepository({
		db: DB,
	});

	beforeAll(async () => {
		await DB.prepare(
			"INSERT INTO users (id, name, email, email_verified, icon_url, hashed_password) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
		)
			.bind("userId", "foo", "user@mail.com", 0, null, "hashedPassword")
			.run();
	});

	test("返り値がSchema通りである(UserSchema)", async () => {
		const updatedUser = await userRepository.update("userId", {
			name: "bar",
			email: "updatedUser@mail.com",
			emailVerified: true,
			iconUrl: "iconUrl",
		});
		const isValid = Value.Check(UserSchema, updatedUser);
		expect(isValid).toBe(true);
	});

	test("返り値が期待通りである", async () => {
		const updatedUser = await userRepository.update("userId", {
			name: "bar",
			email: "updatedUser@mail.com",
			emailVerified: true,
			iconUrl: "iconUrl",
		});
		const schema = t.Object({
			id: t.Literal("userId"),
			name: t.Literal("bar"),
			email: t.Literal("updatedUser@mail.com"),
			emailVerified: t.Literal(true),
			iconUrl: t.Literal("iconUrl"),
			createdAt: t.Date(),
			updatedAt: t.Date(),
		});
		const isValid = Value.Check(schema, updatedUser);
		expect(isValid).toBe(true);
	});

	test("DBにデータが更新されている", async () => {
		await userRepository.update("userId", {
			name: "bar",
			email: "updatedUser@mail.com",
			emailVerified: true,
			iconUrl: "iconUrl",
		});
		const { results } = await DB.prepare("SELECT * FROM users WHERE id = ?1").bind("userId").all();
		const schema = t.Object({
			id: t.Literal("userId"),
			name: t.Literal("bar"),
			email: t.Literal("updatedUser@mail.com"),
			email_verified: t.Literal(1),
			icon_url: t.Literal("iconUrl"),
			hashed_password: t.Literal("hashedPassword"),
			created_at: t.Number(),
			updated_at: t.Number(),
		});
		expect(results.length === 1 && Value.Check(schema, results[0])).toBe(true);
	});
});
