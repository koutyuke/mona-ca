import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../shared/infra/drizzle";
import { EmailVerificationSessionTableHelper, UserTableHelper } from "../../../../../../shared/testing/helpers";
import { createAuthUserFixture, createEmailVerificationSessionFixture } from "../../../../testing/fixtures";
import { convertEmailVerificationSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { EmailVerificationSessionRepository } from "../email-verification-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const emailVerificationSessionTableHelper = new EmailVerificationSessionTableHelper(DB);

const { userRegistration } = createAuthUserFixture();

describe("EmailVerificationSessionRepository.deleteExpiredVerifications", () => {
	beforeEach(async () => {
		await emailVerificationSessionTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should delete data in database", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
				expiresAt: new Date(0),
			},
		});
		await emailVerificationSessionTableHelper.save(convertEmailVerificationSessionToRaw(emailVerificationSession));

		await emailVerificationSessionRepository.deleteExpiredVerifications();

		const results = await emailVerificationSessionTableHelper.findByUserId(emailVerificationSession.userId);

		expect(results.length).toBe(0);
	});
});
