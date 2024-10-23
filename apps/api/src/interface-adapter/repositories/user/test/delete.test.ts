import { env } from "cloudflare:test";
import { DrizzleService } from "@/infrastructure/drizzle";
import { beforeAll, describe, expect, test } from "vitest";
import { UserRepository } from "../user.repository";

const { DB } = env;

describe("Delete User", async () => {
	const drizzleService = new DrizzleService(DB);
	const userRepository = new UserRepository(drizzleService);

	beforeAll(async () => {
		await DB.prepare(
			"INSERT INTO users (id, name, email, email_verified, icon_url, hashed_password) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
		)
			.bind("userId", "foo", "user@mail.com", 0, null, "hashedPassword")
			.run();
	});

	test("DBからデータが削除されている", async () => {
		await userRepository.delete("userId");
		const { results } = await DB.prepare("SELECT * FROM users WHERE id = ?1").bind("userId").all();
		expect(results.length).toBe(0);
	});
});
