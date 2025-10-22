import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { EmailVerificationSessionTableHelper, UserTableHelper } from "../../../../../../core/testing/helpers";
import { newEmailVerificationSessionId } from "../../../../domain/value-objects/ids";
import { createAuthUserFixture, createEmailVerificationSessionFixture } from "../../../../testing/fixtures";
import { convertEmailVerificationSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { EmailVerificationSessionRepository } from "../email-verification-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const emailVerificationSessionTableHelper = new EmailVerificationSessionTableHelper(DB);

const { userRegistration } = createAuthUserFixture();

describe("EmailVerificationSessionRepository.findId", () => {
	beforeEach(async () => {
		await emailVerificationSessionTableHelper.deleteAll();
		await userTableHelper.deleteAll();
	});

	test("should return EmailVerificationSession instance", async () => {
		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));

		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
			},
		});
		await emailVerificationSessionTableHelper.save(convertEmailVerificationSessionToRaw(emailVerificationSession));

		const foundEmailVerificationSession = await emailVerificationSessionRepository.findById(
			emailVerificationSession.id,
		);

		expect(foundEmailVerificationSession).not.toBeNull();
		expect(convertEmailVerificationSessionToRaw(foundEmailVerificationSession!)).toStrictEqual(
			convertEmailVerificationSessionToRaw(emailVerificationSession),
		);
	});

	test("should return null if EmailVerificationSession is not found", async () => {
		const foundInvalidIdEmailVerificationSession = await emailVerificationSessionRepository.findById(
			newEmailVerificationSessionId("invalidId"),
		);

		expect(foundInvalidIdEmailVerificationSession).toBeNull();
	});
});
