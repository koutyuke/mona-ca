import { env } from "cloudflare:test";
import { afterEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../shared/infra/drizzle";
import { SignupSessionTableHelper } from "../../../../../../shared/testing/helpers";
import { newSignupSessionId } from "../../../../domain/value-objects/ids";
import { createSignupSessionFixture } from "../../../../testing/fixtures";
import { SignupSessionRepository } from "../signup-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const signupSessionRepository = new SignupSessionRepository(drizzleService);

const signupSessionTableHelper = new SignupSessionTableHelper(DB);

describe("SignupSessionRepository.deleteById", () => {
	afterEach(async () => {
		await signupSessionTableHelper.deleteAll();
	});

	test("should delete signup session if exists", async () => {
		const { signupSession } = createSignupSessionFixture();
		await signupSessionRepository.save(signupSession);

		await signupSessionRepository.deleteById(signupSession.id);

		const results = await signupSessionTableHelper.findById(signupSession.id);

		expect(results).toHaveLength(0);
	});

	test("should not throw when deleting non existent signup session", async () => {
		await expect(signupSessionRepository.deleteById(newSignupSessionId("nonExistentSessionId"))).resolves.not.toThrow();
	});
});
