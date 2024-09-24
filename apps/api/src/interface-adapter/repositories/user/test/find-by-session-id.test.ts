import { env } from "cloudflare:test";
import { UserSchema } from "@/domain/user";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { beforeAll, describe, expect, test } from "vitest";
import { UserRepository } from "../user.repository";

const { DB } = env;

describe("Find User By Session Id", async () => {
	const userRepository = new UserRepository({
		db: DB,
	});

	beforeAll(async () => {
		await DB.prepare(
			"INSERT INTO users (id, name, email, email_verified, icon_url, hashed_password) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
		)
			.bind("userId", "foo", "user@mail.com", 0, null, "hashedPassword")
			.run();
		await DB.prepare("INSERT INTO session (id, user_id, expires_at) VALUES (?1, ?2, ?3)")
			.bind("sessionId", "userId", 123456)
			.run();
	});

	test("返り値がSchema通りである(UserSchema)", async () => {
		const foundUser = await userRepository.findBySessionId("sessionId");
		const isValid = Value.Check(UserSchema, foundUser);
		expect(isValid).toBe(true);
	});

	test("返り値が期待通りである", async () => {
		const foundUser = await userRepository.findBySessionId("sessionId");
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

	test("間違ったSessionIdを渡した際にnullが返される", async () => {
		const invalidUser = await userRepository.findBySessionId("invalidSessionId");
		expect(invalidUser).toBe(null);
	});
});
