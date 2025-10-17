import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { createUserFixture } from "../../../../../../tests/fixtures";
import { createPasswordResetSessionFixture } from "../../../../../../tests/fixtures";
import { PasswordResetSessionTableHelper, UserTableHelper, toRawDate } from "../../../../../../tests/helpers";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { PasswordResetSessionRepository } from "../password-reset-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const passwordResetSessionTableHelper = new PasswordResetSessionTableHelper(DB);

const now = new Date();

const { user } = createUserFixture();

describe("PasswordResetSessionRepository.save", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, null);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM password_reset_sessions");
	});

	test("should set password reset session in the database", async () => {
		const { passwordResetSession } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
			},
		});

		await passwordResetSessionRepository.save(passwordResetSession);

		const results = await passwordResetSessionTableHelper.findById(passwordResetSession.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(passwordResetSessionTableHelper.convertToRaw(passwordResetSession));
	});

	test("should update password reset session in the database if it already exists", async () => {
		const { passwordResetSession } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
			},
		});
		await passwordResetSessionTableHelper.save(passwordResetSession);

		const updatedPasswordResetSession = {
			...passwordResetSession,
			emailVerified: false,
			expiresAt: now,
		};

		await passwordResetSessionRepository.save(updatedPasswordResetSession);

		const results = await passwordResetSessionTableHelper.findById(passwordResetSession.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			...passwordResetSessionTableHelper.convertToRaw(passwordResetSession),
			email_verified: 0,
			expires_at: toRawDate(now),
		});
	});
});
