import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { newSignupSessionId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { SignupSessionTableHelper } from "../../../../tests/helpers";
import { SignupSessionRepository } from "../signup-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const signupSessionRepository = new SignupSessionRepository(drizzleService);

const signupSessionTableHelper = new SignupSessionTableHelper(DB);

describe("SignupSessionRepository.findById", () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM signup_sessions");
	});

	test("should return SignupSession instance if exists", async () => {
		const { signupSession } = signupSessionTableHelper.createData();
		await signupSessionRepository.save(signupSession);

		const foundSignupSession = await signupSessionRepository.findById(signupSession.id);

		expect(foundSignupSession).toStrictEqual(signupSession);
	});

	test("should return null if SignupSession not found", async () => {
		const foundSignupSession = await signupSessionRepository.findById(newSignupSessionId("invalidId"));

		expect(foundSignupSession).toBeNull();
	});
});
