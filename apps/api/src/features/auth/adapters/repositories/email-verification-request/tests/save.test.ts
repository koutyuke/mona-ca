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

describe("EmailVerificationRequestRepository.create", () => {
	beforeEach(async () => {
		await emailVerificationRequestTableDriver.deleteAll();
		await userTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should create data in database", async () => {
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userRegistration.id,
			},
		});

		await emailVerificationRequestRepository.save(emailVerificationRequest);

		const results = await emailVerificationRequestTableDriver.findById(emailVerificationRequest.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(convertEmailVerificationRequestToRaw(emailVerificationRequest));
	});
});
