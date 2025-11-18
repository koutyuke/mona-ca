import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { EmailVerificationSessionsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { createAuthUserFixture, createEmailVerificationSessionFixture } from "../../../../testing/fixtures";
import { convertEmailVerificationSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/libs";
import { EmailVerificationSessionRepository } from "../email-verification-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const emailVerificationSessionTableDriver = new EmailVerificationSessionsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("EmailVerificationSessionRepository.deleteByUserId", () => {
	beforeEach(async () => {
		await emailVerificationSessionTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should delete data in database", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
			},
		});
		await emailVerificationSessionTableDriver.save(convertEmailVerificationSessionToRaw(emailVerificationSession));

		await emailVerificationSessionRepository.deleteByUserId(emailVerificationSession.userId);

		const results = await emailVerificationSessionTableDriver.findByUserId(userRegistration.id);

		expect(results.length).toBe(0);
	});
});
