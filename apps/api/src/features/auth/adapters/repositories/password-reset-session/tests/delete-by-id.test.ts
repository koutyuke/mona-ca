import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { PasswordResetSessionTableHelper, UserTableHelper } from "../../../../../../core/testing/helpers";
import { createAuthUserFixture, createPasswordResetSessionFixture } from "../../../../testing/fixtures";
import { convertPasswordResetSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { PasswordResetSessionRepository } from "../password-reset-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const passwordResetSessionTableHelper = new PasswordResetSessionTableHelper(DB);

const { userRegistration } = createAuthUserFixture();

describe("PasswordResetSessionRepository.deleteById", () => {
	beforeEach(async () => {
		await passwordResetSessionTableHelper.deleteAll();
	});

	beforeAll(async () => {
		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	afterAll(async () => {
		await userTableHelper.deleteAll();
		await passwordResetSessionTableHelper.deleteAll();
	});

	test("should delete password reset session from database if exists", async () => {
		const { passwordResetSession } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: userRegistration.id,
			},
		});
		await passwordResetSessionTableHelper.save(convertPasswordResetSessionToRaw(passwordResetSession));

		await passwordResetSessionRepository.deleteById(passwordResetSession.id);

		const results = await passwordResetSessionTableHelper.findById(passwordResetSession.id);

		expect(results).toHaveLength(0);
	});
});
