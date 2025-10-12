import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { newEmailVerificationSessionId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { createUserFixture } from "../../../../tests/fixtures";
import { createEmailVerificationSessionFixture } from "../../../../tests/fixtures";
import { EmailVerificationSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { EmailVerificationSessionRepository } from "../email-verification-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const emailVerificationSessionTableHelper = new EmailVerificationSessionTableHelper(DB);

const { user } = createUserFixture();

describe("EmailVerificationSessionRepository.findId", () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM email_verification_sessions");
		await DB.exec("DELETE FROM users");
	});

	test("should return EmailVerificationSession instance", async () => {
		await userTableHelper.save(user, null);

		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
			},
		});
		await emailVerificationSessionTableHelper.save(emailVerificationSession);

		const foundEmailVerificationSession = await emailVerificationSessionRepository.findById(
			emailVerificationSession.id,
		);

		expect(foundEmailVerificationSession).not.toBeNull();
		expect(emailVerificationSessionTableHelper.convertToRaw(foundEmailVerificationSession!)).toStrictEqual(
			emailVerificationSessionTableHelper.convertToRaw(emailVerificationSession),
		);
	});

	test("should return null if EmailVerificationSession is not found", async () => {
		const foundInvalidIdEmailVerificationSession = await emailVerificationSessionRepository.findById(
			newEmailVerificationSessionId("invalidId"),
		);

		expect(foundInvalidIdEmailVerificationSession).toBeNull();
	});
});
