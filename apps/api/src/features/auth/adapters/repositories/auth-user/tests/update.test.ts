import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { UserTableHelper } from "../../../../../../core/testing/helpers";
import { createAuthUserFixture } from "../../../../testing/fixtures";
import { convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { AuthUserRepository } from "../auth-user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const authUserRepository = new AuthUserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);

const { userRegistration, userIdentity } = createAuthUserFixture();

describe("AuthUserRepository.update", async () => {
	beforeEach(async () => {
		await userTableHelper.deleteAll();
	});

	test("should update user identity.", async () => {
		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));

		const updatedUserIdentity = {
			...userIdentity,
			email: "updated@example.com",
			emailVerified: true,
			passwordHash: "updatedPasswordHash",
			updatedAt: new Date(1704067200 * 1000 + 1000),
		};

		await authUserRepository.update(updatedUserIdentity);

		const users = await userTableHelper.findById(userRegistration.id);

		const updatedUserRegistration = {
			...userRegistration,
			...updatedUserIdentity,
		};

		expect(users).toHaveLength(1);
		expect(users[0]).toStrictEqual(convertUserRegistrationToRaw(updatedUserRegistration));
	});

	test("should not throw error if user does not exist.", async () => {
		await expect(authUserRepository.update(userIdentity)).resolves.not.toThrow();
	});
});
