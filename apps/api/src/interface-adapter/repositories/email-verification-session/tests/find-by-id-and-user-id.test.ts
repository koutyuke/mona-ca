import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { newEmailVerificationSessionId, newUserId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { EmailVerificationSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { EmailVerificationSessionRepository } from "../email-verification-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const emailVerificationSessionTableHelper = new EmailVerificationSessionTableHelper(DB);

describe("EmailVerificationSessionRepository.findByUserId", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await emailVerificationSessionTableHelper.create();
	});

	test("should return EmailVerificationSession instance", async () => {
		const foundEmailVerificationSession = await emailVerificationSessionRepository.findByIdAndUserId(
			emailVerificationSessionTableHelper.baseEmailVerificationSession.id,
			emailVerificationSessionTableHelper.baseEmailVerificationSession.userId,
		);

		expect(foundEmailVerificationSession).toStrictEqual(
			emailVerificationSessionTableHelper.baseEmailVerificationSession,
		);
	});

	test("should return null if EmailVerificationSession is not found", async () => {
		const foundInvalidUserIdEmailVerificationSession = await emailVerificationSessionRepository.findByIdAndUserId(
			emailVerificationSessionTableHelper.baseEmailVerificationSession.id,
			newUserId("invalidUserId"),
		);

		expect(foundInvalidUserIdEmailVerificationSession).toBeNull();

		const foundInvalidIdEmailVerificationSession = await emailVerificationSessionRepository.findByIdAndUserId(
			newEmailVerificationSessionId("invalidId"),
			emailVerificationSessionTableHelper.baseEmailVerificationSession.userId,
		);

		expect(foundInvalidIdEmailVerificationSession).toBeNull();

		const foundInvalidIdAndUserIdEmailVerificationSession = await emailVerificationSessionRepository.findByIdAndUserId(
			newEmailVerificationSessionId("invalidId"),
			newUserId("invalidUserId"),
		);

		expect(foundInvalidIdAndUserIdEmailVerificationSession).toBeNull();
	});
});
