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

describe("EmailVerificationRepository.create", () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	test("should create data in database", async () => {
		await emailVerificationRepository.save(emailVerificationTableHelper.baseEmailVerification);

		const results = await emailVerificationTableHelper.findById(emailVerificationTableHelper.baseEmailVerification.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(emailVerificationTableHelper.baseDatabaseEmailVerification);
	});
});
