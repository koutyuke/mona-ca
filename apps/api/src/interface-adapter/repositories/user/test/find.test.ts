import { env } from "cloudflare:test";
import { UserSchema } from "@/domain/user";
import { DrizzleService } from "@/infrastructure/drizzle";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { beforeAll, describe, expect, test } from "vitest";
import { UserRepository } from "../user.repository";

const { DB } = env;

describe("Find User By Id", async () => {
	const drizzleService = new DrizzleService(DB);
	const userRepository = new UserRepository(drizzleService);

	beforeAll(async () => {
		await DB.prepare(
			"INSERT INTO users (id, name, email, email_verified, icon_url, hashed_password) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
		)
			.bind("userId", "foo", "user@mail.com", 0, null, "hashedPassword")
			.run();
	});

	test("返り値がSchema通りである(UserSchema)", async () => {
		const foundUser = await userRepository.find("userId");
		const isValid = Value.Check(UserSchema, foundUser);
		expect(isValid).toBe(true);
	});

	test("返り値が期待通りである", async () => {
		const foundUser = await userRepository.find("userId");
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
		const isValid = Value.Check(schema, foundUser);
		expect(isValid).toBe(true);
	});

	test("間違ったIDを渡した際にnullが返される", async () => {
		const invalidUser = await userRepository.find("invalidId");
		expect(invalidUser).toBe(null);
	});
});
