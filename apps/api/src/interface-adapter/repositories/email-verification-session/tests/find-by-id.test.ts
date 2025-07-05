import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { newEmailVerificationSessionId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { EmailVerificationSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { EmailVerificationSessionRepository } from "../email-verification-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const emailVerificationSessionTableHelper = new EmailVerificationSessionTableHelper(DB);

describe("EmailVerificationSessionRepository.findId", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await emailVerificationSessionTableHelper.create();
	});

	test("should return EmailVerificationSession instance", async () => {
		const foundEmailVerificationSession = await emailVerificationSessionRepository.findById(
			emailVerificationSessionTableHelper.baseData.id,
		);

		expect(foundEmailVerificationSession).toStrictEqual(emailVerificationSessionTableHelper.baseData);
	});

	test("should return null if EmailVerificationSession is not found", async () => {
		const foundInvalidIdEmailVerificationSession = await emailVerificationSessionRepository.findById(
			newEmailVerificationSessionId("invalidId"),
		);

		expect(foundInvalidIdEmailVerificationSession).toBeNull();
	});
});
