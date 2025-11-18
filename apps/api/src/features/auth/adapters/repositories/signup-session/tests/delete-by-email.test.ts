import { env } from "cloudflare:test";
import { afterEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { SignupSessionsTableDriver } from "../../../../../../core/testing/drivers";
import { createSignupSessionFixture } from "../../../../testing/fixtures";
import { SignupSessionRepository } from "../signup-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const signupSessionRepository = new SignupSessionRepository(drizzleService);

const signupSessionTableDriver = new SignupSessionsTableDriver(DB);

describe("SignupSessionRepository.deleteByEmail", () => {
	afterEach(async () => {
		await signupSessionTableDriver.deleteAll();
	});

	test("should delete signup sessions by email", async () => {
		const { signupSession } = createSignupSessionFixture();
		await signupSessionRepository.save(signupSession);

		await signupSessionRepository.deleteByEmail(signupSession.email);

		const results = await signupSessionTableDriver.findByEmail(signupSession.email);

		expect(results).toHaveLength(0);
	});

	test("should not throw when deleting by email with no sessions", async () => {
		await expect(signupSessionRepository.deleteByEmail("notfound@example.com")).resolves.not.toThrow();
	});
});
