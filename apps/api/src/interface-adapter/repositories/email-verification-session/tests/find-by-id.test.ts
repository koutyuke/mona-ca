import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { newEmailVerificationSessionId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { EmailVerificationSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { EmailVerificationSessionRepository } from "../email-verification-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const emailVerificationSessionTableHelper = new EmailVerificationSessionTableHelper(DB);

const { user, passwordHash } = userTableHelper.createData();

describe("EmailVerificationSessionRepository.findId", () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM email_verification_sessions");
		await DB.exec("DELETE FROM users");
	});

	test("should return EmailVerificationSession instance", async () => {
		await userTableHelper.save(user, passwordHash);

		const { session } = emailVerificationSessionTableHelper.createData({
			session: {
				userId: user.id,
			},
		});
		await emailVerificationSessionTableHelper.save(session);

		const foundEmailVerificationSession = await emailVerificationSessionRepository.findById(session.id);

		expect(foundEmailVerificationSession).not.toBeNull();
		expect(emailVerificationSessionTableHelper.convertToRaw(foundEmailVerificationSession!)).toStrictEqual(
			emailVerificationSessionTableHelper.convertToRaw(session),
		);
	});

	test("should return null if EmailVerificationSession is not found", async () => {
		const foundInvalidIdEmailVerificationSession = await emailVerificationSessionRepository.findById(
			newEmailVerificationSessionId("invalidId"),
		);

		expect(foundInvalidIdEmailVerificationSession).toBeNull();
	});
});
