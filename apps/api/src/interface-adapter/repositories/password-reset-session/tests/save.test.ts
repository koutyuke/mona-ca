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
		await passwordResetSessionRepository.save(passwordResetSessionTableHelper.baseData);

		const results = await passwordResetSessionTableHelper.findById(passwordResetSessionTableHelper.baseData.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(passwordResetSessionTableHelper.baseDatabaseData);
	});

	test("should update password reset session in the database if it already exists", async () => {
		await passwordResetSessionTableHelper.create();

		const updatedPasswordResetSession = {
			...passwordResetSessionTableHelper.baseData,
			emailVerified: false,
			expiresAt: now,
		};

		await passwordResetSessionRepository.save(updatedPasswordResetSession);

		const results = await passwordResetSessionTableHelper.findById(passwordResetSessionTableHelper.baseData.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			...passwordResetSessionTableHelper.baseDatabaseData,
			email_verified: 0,
			expires_at: toDatabaseDate(now),
		});
	});
});
