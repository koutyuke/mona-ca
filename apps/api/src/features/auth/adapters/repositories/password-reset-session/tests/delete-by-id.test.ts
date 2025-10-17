import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { createPasswordResetSessionFixture, createUserFixture } from "../../../../../../tests/fixtures";
import { PasswordResetSessionTableHelper, UserTableHelper } from "../../../../../../tests/helpers";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { PasswordResetSessionRepository } from "../password-reset-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const passwordResetSessionTableHelper = new PasswordResetSessionTableHelper(DB);

const { user } = createUserFixture();

describe("PasswordResetSessionRepository.deleteById", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, null);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM password_reset_sessions");
	});

	test("should delete password reset session from database if exists", async () => {
		const { passwordResetSession } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
			},
		});
		await passwordResetSessionTableHelper.save(passwordResetSession);

		await passwordResetSessionRepository.deleteById(passwordResetSession.id);

		const results = await passwordResetSessionTableHelper.findById(passwordResetSession.id);

		expect(results).toHaveLength(0);
	});
});
