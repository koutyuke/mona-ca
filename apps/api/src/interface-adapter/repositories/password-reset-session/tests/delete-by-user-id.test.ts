import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { PasswordResetSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { PasswordResetSessionRepository } from "../password-reset-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const passwordResetSessionTableHelper = new PasswordResetSessionTableHelper(DB);

const { user, passwordHash } = userTableHelper.createData();

describe("PasswordResetSessionRepository.deleteByUserId", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, passwordHash);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM password_reset_sessions");
	});

	test("should delete password reset session from user if exists", async () => {
		const { session } = passwordResetSessionTableHelper.createData({
			session: {
				userId: user.id,
			},
		});
		await passwordResetSessionTableHelper.save(session);

		await passwordResetSessionRepository.deleteByUserId(user.id);

		const results = await passwordResetSessionTableHelper.findByUserId(user.id);

		expect(results).toHaveLength(0);
	});
});
