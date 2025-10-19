import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../../../shared/domain/value-objects";
import { DrizzleService } from "../../../../../../shared/infra/drizzle";
import { UserTableHelper } from "../../../../../../shared/testing/helpers";
import { createAuthUserFixture } from "../../../../testing/fixtures";
import { convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { AuthUserRepository } from "../auth-user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const authUserRepository = new AuthUserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);

const { userRegistration, userIdentity } = createAuthUserFixture();

describe("AuthUserRepository.findById", async () => {
	beforeEach(async () => {
		await userTableHelper.deleteAll();
	});

	test("should return User instance if user exists.", async () => {
		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));

		const foundUserIdentity = await authUserRepository.findById(userRegistration.id);

		expect(foundUserIdentity).not.toBeNull();
		expect(foundUserIdentity).toStrictEqual(userIdentity);
	});

	test("should return null if user not found.", async () => {
		const foundUser = await authUserRepository.findById(newUserId("invalidId"));
		expect(foundUser).toBeNull();
	});
});
