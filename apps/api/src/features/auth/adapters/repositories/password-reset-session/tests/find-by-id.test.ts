import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { PasswordResetSessionsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { newPasswordResetSessionId } from "../../../../domain/value-objects/ids";
import { createAuthUserFixture, createPasswordResetSessionFixture } from "../../../../testing/fixtures";
import { convertPasswordResetSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/libs";
import { PasswordResetSessionRepository } from "../password-reset-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const passwordResetSessionRepository = new PasswordResetSessionRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const passwordResetSessionTableDriver = new PasswordResetSessionsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("PasswordResetSessionRepository.findById", () => {
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

	test("should return PasswordResetSession instance if exists", async () => {
		const { passwordResetSession } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: userRegistration.id,
			},
		});
		await passwordResetSessionTableDriver.save(convertPasswordResetSessionToRaw(passwordResetSession));

		const foundSession = await passwordResetSessionRepository.findById(passwordResetSession.id);

		expect(foundSession).not.toBeNull();
		expect(convertPasswordResetSessionToRaw(foundSession!)).toStrictEqual(
			convertPasswordResetSessionToRaw(passwordResetSession),
		);
	});

	test("should return null if PasswordResetSession not found", async () => {
		const foundPasswordResetSession = await passwordResetSessionRepository.findById(
			newPasswordResetSessionId("invalidId"),
		);

		expect(foundPasswordResetSession).toBeNull();
	});
});
