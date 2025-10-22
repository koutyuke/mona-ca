import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { AccountAssociationSessionTableHelper, UserTableHelper } from "../../../../../../core/testing/helpers";
import { createAccountAssociationSessionFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import { convertAccountAssociationSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { AccountAssociationSessionRepository } from "../account-association-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const accountAssociationSessionTableHelper = new AccountAssociationSessionTableHelper(DB);

const { userRegistration } = createAuthUserFixture();

describe("AccountAssociationSessionRepository.save", () => {
	beforeEach(async () => {
		await accountAssociationSessionTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should create a new session in the database", async () => {
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: userRegistration.id,
			},
		});
		await accountAssociationSessionRepository.save(accountAssociationSession);

		const databaseSessions = await accountAssociationSessionTableHelper.findById(accountAssociationSession.id);

		expect(databaseSessions.length).toBe(1);
		expect(databaseSessions[0]).toStrictEqual(convertAccountAssociationSessionToRaw(accountAssociationSession));
	});
});
