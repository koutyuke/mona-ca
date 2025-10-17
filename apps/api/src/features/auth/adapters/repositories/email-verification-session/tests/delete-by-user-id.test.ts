import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { createUserFixture } from "../../../../../../tests/fixtures";
import { createEmailVerificationSessionFixture } from "../../../../../../tests/fixtures";
import { EmailVerificationSessionTableHelper, UserTableHelper } from "../../../../../../tests/helpers";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { EmailVerificationSessionRepository } from "../email-verification-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const emailVerificationSessionTableHelper = new EmailVerificationSessionTableHelper(DB);

const { user } = createUserFixture();

describe("EmailVerificationSessionRepository.deleteByUserId", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, null);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM email_verification_sessions");
	});

	test("should delete data in database", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
			},
		});
		await emailVerificationSessionTableHelper.save(emailVerificationSession);

		await emailVerificationSessionRepository.deleteByUserId(emailVerificationSession.userId);

		const results = await emailVerificationSessionTableHelper.findByUserId(user.id);

		expect(results.length).toBe(0);
	});
});
