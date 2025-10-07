import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { SignupSessionTableHelper } from "../../../../tests/helpers";
import { SignupSessionRepository } from "../signup-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const signupSessionRepository = new SignupSessionRepository(drizzleService);

const signupSessionTableHelper = new SignupSessionTableHelper(DB);

describe("SignupSessionRepository.deleteById", () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM signup_sessions");
	});

	test("should delete signup session if exists", async () => {
		const { signupSession } = signupSessionTableHelper.createData();
		await signupSessionRepository.save(signupSession);

		await signupSessionRepository.deleteById(signupSession.id);

		const results = await signupSessionTableHelper.findById(signupSession.id);

		expect(results).toHaveLength(0);
	});

	test("should not throw when deleting non existent signup session", async () => {
		await expect(
			signupSessionRepository.deleteById(signupSessionTableHelper.createData().signupSession.id),
		).resolves.not.toThrow();
	});
});
