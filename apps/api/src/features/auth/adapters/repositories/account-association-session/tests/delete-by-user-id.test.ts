import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../../../shared/domain/value-objects";
import { DrizzleService } from "../../../../../../shared/infra/drizzle";
import { AccountAssociationSessionTableHelper, UserTableHelper } from "../../../../../../shared/testing/helpers";
import { createAccountAssociationSessionFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import { convertAccountAssociationSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { AccountAssociationSessionRepository } from "../account-association-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const accountAssociationSessionTableHelper = new AccountAssociationSessionTableHelper(DB);

const { userRegistration } = createAuthUserFixture();

describe("AccountAssociationSessionRepository.deleteByUserId", () => {
	beforeEach(async () => {
		await accountAssociationSessionTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should delete a sessions for a user", async () => {
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: userRegistration.id,
			},
		});
		await accountAssociationSessionTableHelper.save(convertAccountAssociationSessionToRaw(accountAssociationSession));

		await accountAssociationSessionRepository.deleteByUserId(userRegistration.id);

		const sessions = await accountAssociationSessionTableHelper.findByUserId(userRegistration.id);
		expect(sessions).toHaveLength(0);
	});

	test("should not throw error when deleting for a user with no sessions", async () => {
		const userId = newUserId("nonExistentUser");

		// Should not throw an error
		await expect(accountAssociationSessionRepository.deleteByUserId(userId)).resolves.not.toThrow();
	});
});
