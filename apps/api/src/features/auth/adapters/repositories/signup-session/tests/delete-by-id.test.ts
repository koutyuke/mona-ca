import { env } from "cloudflare:test";
import { afterEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { SignupSessionsTableDriver } from "../../../../../../core/testing/drivers";
import { newSignupSessionId } from "../../../../domain/value-objects/ids";
import { createSignupSessionFixture } from "../../../../testing/fixtures";
import { SignupSessionRepository } from "../signup-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const signupSessionRepository = new SignupSessionRepository(drizzleService);

const signupSessionTableDriver = new SignupSessionsTableDriver(DB);

describe("SignupSessionRepository.deleteById", () => {
	afterEach(async () => {
		await signupSessionTableDriver.deleteAll();
	});

	test("should delete signup session if exists", async () => {
		const { signupSession } = createSignupSessionFixture();
		await signupSessionRepository.save(signupSession);

		await signupSessionRepository.deleteById(signupSession.id);

		const results = await signupSessionTableDriver.findById(signupSession.id);

		expect(results).toHaveLength(0);
	});

	test("should not throw when deleting non existent signup session", async () => {
		await expect(signupSessionRepository.deleteById(newSignupSessionId("nonExistentSessionId"))).resolves.not.toThrow();
	});
});
