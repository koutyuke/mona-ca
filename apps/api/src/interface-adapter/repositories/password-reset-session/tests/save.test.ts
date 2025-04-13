import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { PasswordResetSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { toDatabaseDate } from "../../../../tests/utils";
import { PasswordResetSessionRepository } from "../password-reset-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const passwordResetSessionTableHelper = new PasswordResetSessionTableHelper(DB);

const now = new Date();

describe("PasswordResetSessionRepository.save", () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	test("should set password reset session in the database", async () => {
		await passwordResetSessionRepository.save(passwordResetSessionTableHelper.basePasswordResetSession);

		const results = await passwordResetSessionTableHelper.findById(
			passwordResetSessionTableHelper.basePasswordResetSession.id,
		);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(passwordResetSessionTableHelper.baseDatabasePasswordResetSession);
	});

	test("should update password reset session in the database if it already exists", async () => {
		await passwordResetSessionTableHelper.create();

		const updatedPasswordResetSession = {
			id: passwordResetSessionTableHelper.basePasswordResetSession.id,
			userId: passwordResetSessionTableHelper.basePasswordResetSession.userId,
			code: "newCode",
			email: "new.email@example.com",
			emailVerified: false,
			expiresAt: now,
		};

		await passwordResetSessionRepository.save(updatedPasswordResetSession);

		const results = await passwordResetSessionTableHelper.findById(
			passwordResetSessionTableHelper.basePasswordResetSession.id,
		);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			id: passwordResetSessionTableHelper.baseDatabasePasswordResetSession.id,
			user_id: passwordResetSessionTableHelper.baseDatabasePasswordResetSession.user_id,
			code: "newCode",
			email: "new.email@example.com",
			email_verified: 0,
			expires_at: toDatabaseDate(now),
		});
	});
});
