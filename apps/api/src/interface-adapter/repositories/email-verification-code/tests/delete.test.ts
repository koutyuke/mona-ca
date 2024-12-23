import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { EmailVerificationCodeTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { EmailVerificationCodeRepository } from "../email-verification-code.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationCodeRepository = new EmailVerificationCodeRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const emailVerificationCodeTableHelper = new EmailVerificationCodeTableHelper(DB);

describe("EmailVerificationCodeRepository.delete", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await emailVerificationCodeTableHelper.create();
	});

	test("should delete data in database", async () => {
		await emailVerificationCodeRepository.delete({
			email: emailVerificationCodeTableHelper.baseEmailVerificationCode.email,
			userId: emailVerificationCodeTableHelper.baseEmailVerificationCode.userId,
		});

		const results = await emailVerificationCodeTableHelper.find(
			emailVerificationCodeTableHelper.baseEmailVerificationCode.userId,
		);

		expect(results.length).toBe(0);
	});
});
