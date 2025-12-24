import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { PasswordResetSessionsTableDriver, UsersTableDriver, toRawDate } from "../../../../../../core/testing/drivers";
import { convertPasswordResetSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAuthUserFixture, createPasswordResetSessionFixture } from "../../../../testing/fixtures";
import { PasswordResetSessionRepository } from "../password-reset-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const passwordResetSessionTableDriver = new PasswordResetSessionsTableDriver(DB);

const now = new Date();

const { userRegistration } = createAuthUserFixture();

describe("PasswordResetSessionRepository.save", () => {
	beforeEach(async () => {
		await passwordResetSessionTableDriver.deleteAll();
	});

	beforeAll(async () => {
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	afterAll(async () => {
		await userTableDriver.deleteAll();
		await passwordResetSessionTableDriver.deleteAll();
	});

	test("should set password reset session in the database", async () => {
		const { passwordResetSession } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: userRegistration.id,
			},
		});

		await passwordResetSessionRepository.save(passwordResetSession);

		const results = await passwordResetSessionTableDriver.findById(passwordResetSession.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(convertPasswordResetSessionToRaw(passwordResetSession));
	});

	test("should update password reset session in the database if it already exists", async () => {
		const { passwordResetSession } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: userRegistration.id,
			},
		});
		await passwordResetSessionTableDriver.save(convertPasswordResetSessionToRaw(passwordResetSession));

		const updatedPasswordResetSession = {
			...passwordResetSession,
			emailVerified: false,
			expiresAt: now,
		};

		await passwordResetSessionRepository.save(updatedPasswordResetSession);

		const results = await passwordResetSessionTableDriver.findById(passwordResetSession.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			...convertPasswordResetSessionToRaw(passwordResetSession),
			email_verified: 0,
			expires_at: toRawDate(now),
		});
	});
});
