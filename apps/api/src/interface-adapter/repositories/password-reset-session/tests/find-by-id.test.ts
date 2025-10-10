import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { newPasswordResetSessionId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { PasswordResetSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { PasswordResetSessionRepository } from "../password-reset-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const passwordResetSessionTableHelper = new PasswordResetSessionTableHelper(DB);

const { user, passwordHash } = userTableHelper.createData();

describe("PasswordResetSessionRepository.findById", () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM password_reset_sessions");
		await DB.exec("DELETE FROM users");
	});

	test("should return PasswordResetSession instance if exists", async () => {
		await userTableHelper.save(user, passwordHash);

		const { session } = passwordResetSessionTableHelper.createData({
			session: {
				userId: user.id,
			},
		});
		await passwordResetSessionTableHelper.save(session);

		const foundSession = await passwordResetSessionRepository.findById(session.id);

		expect(foundSession).not.toBeNull();
		expect(passwordResetSessionTableHelper.convertToRaw(foundSession!)).toStrictEqual(
			passwordResetSessionTableHelper.convertToRaw(session),
		);
	});

	test("should return null if PasswordResetSession not found", async () => {
		const foundPasswordResetSession = await passwordResetSessionRepository.findById(
			newPasswordResetSessionId("invalidId"),
		);

		expect(foundPasswordResetSession).toBeNull();
	});
});
