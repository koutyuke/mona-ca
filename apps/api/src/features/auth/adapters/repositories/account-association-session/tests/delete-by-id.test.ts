import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { AccountAssociationSessionTableHelper, UserTableHelper } from "../../../../../../core/testing/helpers";
import { newAccountAssociationSessionId } from "../../../../domain/value-objects/ids";
import { createAccountAssociationSessionFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import { convertAccountAssociationSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { AccountAssociationSessionRepository } from "../account-association-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const accountAssociationSessionTableHelper = new AccountAssociationSessionTableHelper(DB);

const { userRegistration } = createAuthUserFixture();

describe("AccountAssociationSessionRepository.delete", () => {
	beforeEach(async () => {
		await accountAssociationSessionTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should delete session by id", async () => {
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: userRegistration.id,
			},
		});
		await accountAssociationSessionTableHelper.save(convertAccountAssociationSessionToRaw(accountAssociationSession));

		await accountAssociationSessionRepository.deleteById(accountAssociationSession.id);

		const databaseSessions = await accountAssociationSessionTableHelper.findById(accountAssociationSession.id);
		expect(databaseSessions).toHaveLength(0);
	});

	test("should not throw error when deleting non-existent session", async () => {
		const nonExistentSessionId = newAccountAssociationSessionId("nonExistentSessionId");

		await expect(accountAssociationSessionRepository.deleteById(nonExistentSessionId)).resolves.not.toThrow();
	});
});
