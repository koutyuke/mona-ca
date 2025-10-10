import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
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

const { user, passwordHash } = createUserFixture();

describe("EmailVerificationSessionRepository.create", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, passwordHash);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM email_verification_sessions");
	});

	test("should create data in database", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: user.id,
			},
		});

		await emailVerificationSessionRepository.save(emailVerificationSession);

		const results = await emailVerificationSessionTableHelper.findById(emailVerificationSession.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(emailVerificationSessionTableHelper.convertToRaw(emailVerificationSession));
	});
});
