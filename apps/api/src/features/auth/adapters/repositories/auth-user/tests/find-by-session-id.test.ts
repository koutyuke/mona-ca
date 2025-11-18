import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { SessionsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { newSessionId } from "../../../../domain/value-objects/ids";
import { createAuthUserFixture, createSessionFixture } from "../../../../testing/fixtures";
import { convertSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/libs";
import { AuthUserRepository } from "../auth-user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const authUserRepository = new AuthUserRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const sessionTableDriver = new SessionsTableDriver(DB);

const { userRegistration, userCredentials } = createAuthUserFixture();

describe("AuthUserRepository.findBySessionId", async () => {
	beforeEach(async () => {
		await userTableDriver.deleteAll();
		await sessionTableDriver.deleteAll();
	});

	test("should return User instance if user exists.", async () => {
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));

		const { session } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});
		await sessionTableDriver.save(convertSessionToRaw(session));

		const foundUserCredentials = await authUserRepository.findBySessionId(session.id);

		expect(foundUserCredentials).not.toBeNull();
		expect(foundUserCredentials).toStrictEqual(userCredentials);
	});

	test("should return null if user not found.", async () => {
		const foundUserCredentials = await authUserRepository.findBySessionId(newSessionId("invalidSessionId"));
		expect(foundUserCredentials).toBeNull();
	});
});
