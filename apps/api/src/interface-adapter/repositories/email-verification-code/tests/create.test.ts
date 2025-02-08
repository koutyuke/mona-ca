import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { EmailVerificationCode } from "../../../../models/entities/email-verification-code";
import { EmailVerificationCodeTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { EmailVerificationCodeRepository } from "../email-verification-code.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationCodeRepository = new EmailVerificationCodeRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const emailVerificationCodeTableHelper = new EmailVerificationCodeTableHelper(DB);

describe("EmailVerificationCodeRepository.create", () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	test("should return EmailVerificationCode instance", async () => {
		const createdEmailVerificationCode = await emailVerificationCodeRepository.create(
			emailVerificationCodeTableHelper.baseEmailVerificationCode,
		);

		const expectedEmailVerificationCode = new EmailVerificationCode(
			emailVerificationCodeTableHelper.baseEmailVerificationCode,
		);

		expect(createdEmailVerificationCode).toStrictEqual(expectedEmailVerificationCode);
	});

	test("should create data in database", async () => {
		await emailVerificationCodeRepository.create(emailVerificationCodeTableHelper.baseEmailVerificationCode);

		const results = await emailVerificationCodeTableHelper.find(
			emailVerificationCodeTableHelper.baseEmailVerificationCode.userId,
		);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(emailVerificationCodeTableHelper.baseDatabaseEmailVerificationCode);
	});
});
