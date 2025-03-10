import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { EmailVerificationSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { EmailVerificationSessionRepository } from "../email-verification-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const emailVerificationSessionTableHelper = new EmailVerificationSessionTableHelper(DB);

describe("EmailVerificationSessionRepository.deleteByUserId", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await emailVerificationSessionTableHelper.create();
	});

	test("should delete data in database", async () => {
		await emailVerificationSessionRepository.deleteByUserId(
			emailVerificationSessionTableHelper.baseEmailVerificationSession.userId,
		);

		const results = await emailVerificationSessionTableHelper.findByUserId(
			emailVerificationSessionTableHelper.baseEmailVerificationSession.userId,
		);

		expect(results.length).toBe(0);
	});
});
