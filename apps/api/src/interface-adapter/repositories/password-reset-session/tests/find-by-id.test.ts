import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { newPasswordResetSessionId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { PasswordResetSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { PasswordResetSessionRepository } from "../password-reset-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const passwordResetSessionTableHelper = new PasswordResetSessionTableHelper(DB);

describe("PasswordResetSessionRepository.findById", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await passwordResetSessionTableHelper.create();
	});

	test("should return PasswordResetSession instance if exists", async () => {
		const foundPasswordResetSession = await passwordResetSessionRepository.findById(
			passwordResetSessionTableHelper.basePasswordResetSession.id,
		);

		expect(foundPasswordResetSession).toStrictEqual(passwordResetSessionTableHelper.basePasswordResetSession);
	});

	test("should return null if PasswordResetSession not found", async () => {
		const foundPasswordResetSession = await passwordResetSessionRepository.findById(
			newPasswordResetSessionId("invalidId"),
		);

		expect(foundPasswordResetSession).toBeNull();
	});
});
