import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { PasswordResetSessionsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { convertPasswordResetSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAuthUserFixture, createPasswordResetSessionFixture } from "../../../../testing/fixtures";
import { PasswordResetSessionRepository } from "../password-reset-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const passwordResetSessionTableDriver = new PasswordResetSessionsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("PasswordResetSessionRepository.deleteById", () => {
	beforeEach(async () => {
		await passwordResetSessionTableDriver.deleteAll();
	});

	beforeAll(async () => {
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	afterAll(async () => {
		await userTableDriver.deleteAll();
		await passwordResetSessionTableDriver.deleteAll();
	});

	test("should delete password reset session from database if exists", async () => {
		const { passwordResetSession } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: userRegistration.id,
			},
		});
		await passwordResetSessionTableDriver.save(convertPasswordResetSessionToRaw(passwordResetSession));

		await passwordResetSessionRepository.deleteById(passwordResetSession.id);

		const results = await passwordResetSessionTableDriver.findById(passwordResetSession.id);

		expect(results).toHaveLength(0);
	});
});
