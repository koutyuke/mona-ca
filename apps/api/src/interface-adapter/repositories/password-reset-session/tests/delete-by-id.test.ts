import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { PasswordResetSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { PasswordResetSessionRepository } from "../password-reset-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const passwordResetSessionTableHelper = new PasswordResetSessionTableHelper(DB);

describe("PasswordResetSessionRepository.deleteById", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await passwordResetSessionTableHelper.create();
	});

	test("should delete password reset session from database if exists", async () => {
		await passwordResetSessionRepository.deleteById(passwordResetSessionTableHelper.baseData.id);

		const results = await passwordResetSessionTableHelper.findById(passwordResetSessionTableHelper.baseData.id);

		expect(results).toHaveLength(0);
	});
});
