import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { createSignupSessionFixture } from "../../../../../../tests/fixtures";
import { SignupSessionTableHelper } from "../../../../../../tests/helpers";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { SignupSessionRepository } from "../signup-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const signupSessionRepository = new SignupSessionRepository(drizzleService);

const signupSessionTableHelper = new SignupSessionTableHelper(DB);

describe("SignupSessionRepository.deleteByEmail", () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM signup_sessions");
	});

	test("should delete signup sessions by email", async () => {
		const { signupSession } = createSignupSessionFixture();
		await signupSessionRepository.save(signupSession);

		await signupSessionRepository.deleteByEmail(signupSession.email);

		const results = await signupSessionTableHelper.findByEmail(signupSession.email);

		expect(results).toHaveLength(0);
	});

	test("should not throw when deleting by email with no sessions", async () => {
		await expect(signupSessionRepository.deleteByEmail("notfound@example.com")).resolves.not.toThrow();
	});
});
