import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { PasswordResetSessionTableHelper, UserTableHelper, toRawDate } from "../../../../tests/helpers";
import { PasswordResetSessionRepository } from "../password-reset-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const passwordResetSessionTableHelper = new PasswordResetSessionTableHelper(DB);

const now = new Date();

const { user, passwordHash } = userTableHelper.createData();

describe("PasswordResetSessionRepository.save", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, passwordHash);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM password_reset_sessions");
	});

	test("should set password reset session in the database", async () => {
		const { session } = passwordResetSessionTableHelper.createData({
			session: {
				userId: user.id,
			},
		});

		await passwordResetSessionRepository.save(session);

		const results = await passwordResetSessionTableHelper.findById(session.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(passwordResetSessionTableHelper.convertToRaw(session));
	});

	test("should update password reset session in the database if it already exists", async () => {
		const { session } = passwordResetSessionTableHelper.createData({
			session: {
				userId: user.id,
			},
		});
		await passwordResetSessionTableHelper.save(session);

		const updatedPasswordResetSession = {
			...session,
			emailVerified: false,
			expiresAt: now,
		};

		await passwordResetSessionRepository.save(updatedPasswordResetSession);

		const results = await passwordResetSessionTableHelper.findById(session.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			...passwordResetSessionTableHelper.convertToRaw(session),
			email_verified: 0,
			expires_at: toRawDate(now),
		});
	});
});
