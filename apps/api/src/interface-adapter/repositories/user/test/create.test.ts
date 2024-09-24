import { env } from "cloudflare:test";
import { UserSchema } from "@/domain/user";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { describe, expect, test } from "vitest";
import { UserRepository } from "../user.repository";

const { DB } = env;

describe("Create User", async () => {
	const userRepository = new UserRepository({
		db: DB,
	});

	test("返り値がSchema通りである(UserSchema)", async () => {
		const createdUser = await userRepository.create({
			id: "userId",
			name: "foo",
			email: "user@mail.com",
			emailVerified: false,
			iconUrl: null,
			gender: "man",
			hashedPassword: "hashedPassword",
		});
		const isValid = Value.Check(UserSchema, createdUser);
		expect(isValid).toBe(true);
	});

	test("返り値が期待通りである", async () => {
		const createdUser = await userRepository.create({
			id: "userId",
			name: "foo",
			email: "user@mail.com",
			emailVerified: false,
			iconUrl: null,
			gender: "man",
			hashedPassword: "hashedPassword",
		});

		const schema = t.Object({
			id: t.Literal("userId"),
			name: t.Literal("foo"),
			email: t.Literal("user@mail.com"),
			emailVerified: t.Literal(false),
			iconUrl: t.Null(),
			gender: t.Literal("man"),
			createdAt: t.Date(),
			updatedAt: t.Date(),
		});
		const isValid = Value.Check(schema, createdUser);
		expect(isValid).toBe(true);
	});

	test("DBにデータが保存されている", async () => {
		await userRepository.create({
			id: "userId",
			name: "foo",
			email: "user@mail.com",
			emailVerified: false,
			iconUrl: null,
			gender: "man",
			hashedPassword: "hashedPassword",
		});

		const { results } = await DB.prepare("SELECT * FROM users WHERE id = ?1").bind("userId").all();
		const schema = t.Object({
			id: t.Literal("userId"),
			name: t.Literal("foo"),
			email: t.Literal("user@mail.com"),
			email_verified: t.Literal(0),
			icon_url: t.Null(),
			hashed_password: t.Literal("hashedPassword"),
			gender: t.Literal("man"),
			created_at: t.Number(),
			updated_at: t.Number(),
		});
		expect(results.length === 1 && Value.Check(schema, results[0])).toBe(true);
	});
});
