import { env } from "cloudflare:test";
import { UserCredentialsSchema } from "@/domain/user-credentials";
import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import { beforeAll, describe, expect, test } from "vitest";
import { UserCredentialsRepository } from "../user-credentials.repository";

const { DB } = env;

describe("Find UserCredentials", () => {
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
		const userCredentials = await userCredentialsRepository.findByUserId("userId");
		const isValid = Value.Check(UserCredentialsSchema, userCredentials);
		expect(isValid).toBe(true);
	});

	test("返り値が期待通りである", async () => {
		const userCredentials = await userCredentialsRepository.findByUserId("userId");
		const schema = t.Object({
			userId: t.Literal("userId"),
			hashedPassword: t.Literal("hashedPassword"),
		});
		const isValid = Value.Check(schema, userCredentials);
		expect(isValid).toBe(true);
	});
});
