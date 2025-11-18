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

describe("SignupSessionRepository.findById", () => {
	afterEach(async () => {
		await signupSessionTableDriver.deleteAll();
	});

	test("should return SignupSession instance if exists", async () => {
		const { signupSession } = createSignupSessionFixture();
		await signupSessionRepository.save(signupSession);

		const foundSignupSession = await signupSessionRepository.findById(signupSession.id);

		expect(foundSignupSession).toStrictEqual(signupSession);
	});

	test("should return null if SignupSession not found", async () => {
		const foundSignupSession = await signupSessionRepository.findById(newSignupSessionId("invalidId"));

		expect(foundSignupSession).toBeNull();
	});
});
