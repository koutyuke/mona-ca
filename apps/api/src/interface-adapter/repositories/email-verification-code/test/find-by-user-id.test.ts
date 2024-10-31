import { env } from "cloudflare:test";
import { EmailVerificationCode } from "@/domain/email-verification-code";
import { DrizzleService } from "@/infrastructure/drizzle";
import { EmailVerificationCodeTableHelper, UserTableHelper } from "@/tests/helpers";
import { beforeAll, describe, expect, test } from "vitest";
import { EmailVerificationCodeRepository } from "../email-verification-code.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationCodeRepository = new EmailVerificationCodeRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const emailVerificationCodeTableHelper = new EmailVerificationCodeTableHelper(DB);

describe("EmailVerificationCodeRepository.findByUserId", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await emailVerificationCodeTableHelper.create();
	});

	test("should return EmailVerificationCode instance", async () => {
		const foundEmailVerificationCode = await emailVerificationCodeRepository.findByUserId(
			emailVerificationCodeTableHelper.baseEmailVerificationCode.userId,
		);

		const expectedEmailVerificationCode = new EmailVerificationCode(
			emailVerificationCodeTableHelper.baseEmailVerificationCode,
		);

		expect(foundEmailVerificationCode).toStrictEqual(expectedEmailVerificationCode);
	});

	test("should return null if EmailVerificationCode is not found", async () => {
		const foundEmailVerificationCode = await emailVerificationCodeRepository.findByUserId("invalidUserId");

		expect(foundEmailVerificationCode).toBeNull();
	});
});
