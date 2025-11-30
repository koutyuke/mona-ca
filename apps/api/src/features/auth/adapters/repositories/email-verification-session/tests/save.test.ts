import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { EmailVerificationSessionsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { convertEmailVerificationSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAuthUserFixture, createEmailVerificationSessionFixture } from "../../../../testing/fixtures";
import { EmailVerificationSessionRepository } from "../email-verification-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const emailVerificationSessionTableDriver = new EmailVerificationSessionsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("EmailVerificationSessionRepository.create", () => {
	beforeEach(async () => {
		await emailVerificationSessionTableDriver.deleteAll();
		await userTableDriver.deleteAll();

		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should create data in database", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
			},
		});

		await emailVerificationSessionRepository.save(emailVerificationSession);

		const results = await emailVerificationSessionTableDriver.findById(emailVerificationSession.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(convertEmailVerificationSessionToRaw(emailVerificationSession));
	});
});
