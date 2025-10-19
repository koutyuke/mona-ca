import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../shared/infra/drizzle";
import { PasswordResetSessionTableHelper, UserTableHelper, toRawDate } from "../../../../../../shared/testing/helpers";
import { createAuthUserFixture, createPasswordResetSessionFixture } from "../../../../testing/fixtures";
import { convertPasswordResetSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { PasswordResetSessionRepository } from "../password-reset-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const passwordResetSessionTableHelper = new PasswordResetSessionTableHelper(DB);

const now = new Date();

const { userRegistration } = createAuthUserFixture();

describe("PasswordResetSessionRepository.save", () => {
	beforeEach(async () => {
		await passwordResetSessionTableHelper.deleteAll();
	});

	beforeAll(async () => {
		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	afterAll(async () => {
		await userTableHelper.deleteAll();
		await passwordResetSessionTableHelper.deleteAll();
	});

	test("should set password reset session in the database", async () => {
		const { passwordResetSession } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: userRegistration.id,
			},
		});

		await passwordResetSessionRepository.save(passwordResetSession);

		const results = await passwordResetSessionTableHelper.findById(passwordResetSession.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(convertPasswordResetSessionToRaw(passwordResetSession));
	});

	test("should update password reset session in the database if it already exists", async () => {
		const { passwordResetSession } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: userRegistration.id,
			},
		});
		await passwordResetSessionTableHelper.save(convertPasswordResetSessionToRaw(passwordResetSession));

		const updatedPasswordResetSession = {
			...passwordResetSession,
			emailVerified: false,
			expiresAt: now,
		};

		await passwordResetSessionRepository.save(updatedPasswordResetSession);

		const results = await passwordResetSessionTableHelper.findById(passwordResetSession.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			...convertPasswordResetSessionToRaw(passwordResetSession),
			email_verified: 0,
			expires_at: toRawDate(now),
		});
	});
});
