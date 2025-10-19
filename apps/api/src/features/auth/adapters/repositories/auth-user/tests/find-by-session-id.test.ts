import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../shared/infra/drizzle";
import { SessionTableHelper, UserTableHelper } from "../../../../../../shared/testing/helpers";
import { newSessionId } from "../../../../domain/value-objects/ids";
import { createAuthUserFixture, createSessionFixture } from "../../../../testing/fixtures";
import { convertSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { AuthUserRepository } from "../auth-user.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const authUserRepository = new AuthUserRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

const { userRegistration, userIdentity } = createAuthUserFixture();

describe("AuthUserRepository.findBySessionId", async () => {
	beforeEach(async () => {
		await userTableHelper.deleteAll();
		await sessionTableHelper.deleteAll();
	});

	test("should return User instance if user exists.", async () => {
		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));

		const { session } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});
		await sessionTableHelper.save(convertSessionToRaw(session));

		const foundUserIdentity = await authUserRepository.findBySessionId(session.id);

		expect(foundUserIdentity).not.toBeNull();
		expect(foundUserIdentity).toStrictEqual(userIdentity);
	});

	test("should return null if user not found.", async () => {
		const foundUser = await authUserRepository.findBySessionId(newSessionId("invalidSessionId"));
		expect(foundUser).toBeNull();
	});
});
