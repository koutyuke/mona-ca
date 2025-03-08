import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { newUserId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { EmailVerificationTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { EmailVerificationRepository } from "../email-verification.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationRepository = new EmailVerificationRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const emailVerificationTableHelper = new EmailVerificationTableHelper(DB);

describe("EmailVerificationRepository.findByUserId", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await emailVerificationTableHelper.create();
	});

	test("should return EmailVerification instance", async () => {
		const foundEmailVerification = await emailVerificationRepository.findByUserId(
			emailVerificationTableHelper.baseEmailVerification.userId,
		);

		expect(foundEmailVerification).toStrictEqual(emailVerificationTableHelper.baseEmailVerification);
	});

	test("should return null if EmailVerification is not found", async () => {
		const foundEmailVerification = await emailVerificationRepository.findByUserId(newUserId("invalidUserId"));

		expect(foundEmailVerification).toBeNull();
	});
});
