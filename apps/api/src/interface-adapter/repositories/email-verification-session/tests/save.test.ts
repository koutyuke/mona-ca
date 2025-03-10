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

describe("EmailVerificationSessionRepository.create", () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	test("should create data in database", async () => {
		await emailVerificationSessionRepository.save(emailVerificationSessionTableHelper.baseEmailVerificationSession);

		const results = await emailVerificationSessionTableHelper.findById(
			emailVerificationSessionTableHelper.baseEmailVerificationSession.id,
		);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(emailVerificationSessionTableHelper.baseDatabaseEmailVerificationSession);
	});
});
