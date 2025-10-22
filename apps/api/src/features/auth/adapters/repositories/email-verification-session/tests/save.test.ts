import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { EmailVerificationSessionTableHelper, UserTableHelper } from "../../../../../../core/testing/helpers";
import { createAuthUserFixture, createEmailVerificationSessionFixture } from "../../../../testing/fixtures";
import { convertEmailVerificationSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { EmailVerificationSessionRepository } from "../email-verification-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const emailVerificationSessionTableHelper = new EmailVerificationSessionTableHelper(DB);

const { userRegistration } = createAuthUserFixture();

describe("EmailVerificationSessionRepository.create", () => {
	beforeEach(async () => {
		await emailVerificationSessionTableHelper.deleteAll();
		await userTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should create data in database", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
			},
		});

		await emailVerificationSessionRepository.save(emailVerificationSession);

		const results = await emailVerificationSessionTableHelper.findById(emailVerificationSession.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(convertEmailVerificationSessionToRaw(emailVerificationSession));
	});
});
