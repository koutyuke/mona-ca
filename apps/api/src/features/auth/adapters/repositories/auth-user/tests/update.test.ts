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

describe("AuthUserRepository.update", async () => {
	beforeEach(async () => {
		await userTableDriver.deleteAll();
	});

	test("should update user identity.", async () => {
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));

		const updatedUserCredentials = {
			...userCredentials,
			email: "updated@example.com",
			emailVerified: true,
			passwordHash: "updatedPasswordHash",
			updatedAt: new Date(1704067200 * 1000 + 1000),
		};

		await authUserRepository.update(updatedUserCredentials);

		const users = await userTableDriver.findById(userRegistration.id);

		const updatedUserRegistration = {
			...userRegistration,
			...updatedUserCredentials,
		};

		expect(users).toHaveLength(1);
		expect(users[0]).toStrictEqual(convertUserRegistrationToRaw(updatedUserRegistration));
	});

	test("should not throw error if user does not exist.", async () => {
		await expect(authUserRepository.update(userCredentials)).resolves.not.toThrow();
	});
});
