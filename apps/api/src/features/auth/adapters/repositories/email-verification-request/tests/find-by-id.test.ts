import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { EmailVerificationRequestsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { newEmailVerificationRequestId } from "../../../../domain/value-objects/ids";
import { convertEmailVerificationRequestToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAuthUserFixture, createEmailVerificationRequestFixture } from "../../../../testing/fixtures";
import { EmailVerificationRequestRepository } from "../email-verification-request.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationRequestRepository = new EmailVerificationRequestRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const emailVerificationRequestTableDriver = new EmailVerificationRequestsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("EmailVerificationRequestRepository.findId", () => {
	beforeEach(async () => {
		await emailVerificationRequestTableDriver.deleteAll();
		await userTableDriver.deleteAll();
	});

	test("should return EmailVerificationRequest instance", async () => {
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));

		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userRegistration.id,
			},
		});
		await emailVerificationRequestTableDriver.save(convertEmailVerificationRequestToRaw(emailVerificationRequest));

		const foundEmailVerificationRequest = await emailVerificationRequestRepository.findById(
			emailVerificationRequest.id,
		);

		expect(foundEmailVerificationRequest).not.toBeNull();
		expect(convertEmailVerificationRequestToRaw(foundEmailVerificationRequest!)).toStrictEqual(
			convertEmailVerificationRequestToRaw(emailVerificationRequest),
		);
	});

	test("should return null if EmailVerificationRequest is not found", async () => {
		const foundInvalidIdEmailVerificationRequest = await emailVerificationRequestRepository.findById(
			newEmailVerificationRequestId("invalidId"),
		);

		expect(foundInvalidIdEmailVerificationRequest).toBeNull();
	});
});
