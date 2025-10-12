import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { newPasswordResetSessionId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { createPasswordResetSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import { PasswordResetSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { PasswordResetSessionRepository } from "../password-reset-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const passwordResetSessionTableHelper = new PasswordResetSessionTableHelper(DB);

const { user } = createUserFixture();

describe("PasswordResetSessionRepository.findById", () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM password_reset_sessions");
		await DB.exec("DELETE FROM users");
	});

	test("should return PasswordResetSession instance if exists", async () => {
		await userTableHelper.save(user, null);

		const { passwordResetSession } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
			},
		});
		await passwordResetSessionTableHelper.save(passwordResetSession);

		const foundSession = await passwordResetSessionRepository.findById(passwordResetSession.id);

		expect(foundSession).not.toBeNull();
		expect(passwordResetSessionTableHelper.convertToRaw(foundSession!)).toStrictEqual(
			passwordResetSessionTableHelper.convertToRaw(passwordResetSession),
		);
	});

	test("should return null if PasswordResetSession not found", async () => {
		const foundPasswordResetSession = await passwordResetSessionRepository.findById(
			newPasswordResetSessionId("invalidId"),
		);

		expect(foundPasswordResetSession).toBeNull();
	});
});
