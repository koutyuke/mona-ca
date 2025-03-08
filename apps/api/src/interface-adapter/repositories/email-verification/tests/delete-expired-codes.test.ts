import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { EmailVerificationTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { EmailVerificationRepository } from "../email-verification.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationRepository = new EmailVerificationRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const emailVerificationTableHelper = new EmailVerificationTableHelper(DB);

describe("EmailVerificationRepository.deleteExpiredVerifications", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await emailVerificationTableHelper.create();
	});

	test("should delete data in database", async () => {
		await emailVerificationRepository.deleteExpiredVerifications();

		const results = await emailVerificationTableHelper.findByUserId(
			emailVerificationTableHelper.baseEmailVerification.userId,
		);

		expect(results.length).toBe(0);
	});
});
