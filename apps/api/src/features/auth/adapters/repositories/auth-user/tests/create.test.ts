import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { UsersTableDriver } from "../../../../../../core/testing/drivers";
import { convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAuthUserFixture } from "../../../../testing/fixtures";
import { AuthUserRepository } from "../auth-user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const authUserRepository = new AuthUserRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("AuthUserRepository.create", async () => {
	beforeEach(async () => {
		await userTableDriver.deleteAll();
	});

	test("should create a new user.", async () => {
		await authUserRepository.create(userRegistration);

		const users = await userTableDriver.findById(userRegistration.id);

		expect(users).toHaveLength(1);
		expect(users[0]).toStrictEqual(convertUserRegistrationToRaw(userRegistration));
	});

	test("should not create a user if user with same id already exists (onConflictDoNothing).", async () => {
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));

		const modifiedUserRegistration = {
			...userRegistration,
			email: "modified@example.com",
		};

		await authUserRepository.create(modifiedUserRegistration);

		const users = await userTableDriver.findById(userRegistration.id);

		expect(users).toHaveLength(1);
		expect(users[0]).toStrictEqual(convertUserRegistrationToRaw(userRegistration));
	});
});
