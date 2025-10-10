import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { EmailVerificationSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { EmailVerificationSessionRepository } from "../email-verification-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const emailVerificationSessionTableHelper = new EmailVerificationSessionTableHelper(DB);

const { user, passwordHash } = userTableHelper.createData();

describe("EmailVerificationSessionRepository.deleteExpiredVerifications", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, passwordHash);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM email_verification_sessions");
	});

	test("should delete data in database", async () => {
		const { session } = emailVerificationSessionTableHelper.createData({
			session: {
				userId: user.id,
				expiresAt: new Date(0),
			},
		});
		await emailVerificationSessionTableHelper.save(session);

		await emailVerificationSessionRepository.deleteExpiredVerifications();

		const results = await emailVerificationSessionTableHelper.findByUserId(user.id);

		expect(results.length).toBe(0);
	});
});
