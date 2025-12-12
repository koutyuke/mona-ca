import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { EmailVerificationRequestsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { convertEmailVerificationRequestToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAuthUserFixture, createEmailVerificationRequestFixture } from "../../../../testing/fixtures";
import { EmailVerificationRequestRepository } from "../email-verification-request.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationRequestRepository = new EmailVerificationRequestRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const emailVerificationRequestTableDriver = new EmailVerificationRequestsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("EmailVerificationRequestRepository.deleteExpiredVerifications", () => {
	beforeEach(async () => {
		await emailVerificationRequestTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should delete data in database", async () => {
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userRegistration.id,
				expiresAt: new Date(0),
			},
		});
		await emailVerificationRequestTableDriver.save(convertEmailVerificationRequestToRaw(emailVerificationRequest));

		await emailVerificationRequestRepository.deleteExpiredVerifications();

		const results = await emailVerificationRequestTableDriver.findByUserId(emailVerificationRequest.userId);

		expect(results.length).toBe(0);
	});
});
