import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { UsersTableDriver } from "../../../../../../core/testing/drivers";
import { createAuthUserFixture } from "../../../../testing/fixtures";
import { convertUserRegistrationToRaw } from "../../../../testing/libs";
import { AuthUserRepository } from "../auth-user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const authUserRepository = new AuthUserRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);

const { userRegistration, userCredentials } = createAuthUserFixture();

describe("AuthUserRepository.findByEmail", async () => {
	beforeEach(async () => {
		await userTableDriver.deleteAll();
	});

	test("should return User instance if user exists.", async () => {
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));

		const foundUserCredentials = await authUserRepository.findByEmail(userRegistration.email);

		expect(foundUserCredentials).not.toBeNull();
		expect(foundUserCredentials).toStrictEqual(userCredentials);
	});

	test("should return null if user not found.", async () => {
		const foundUserCredentials = await authUserRepository.findByEmail("invalid@example.com");
		expect(foundUserCredentials).toBeNull();
	});
});
