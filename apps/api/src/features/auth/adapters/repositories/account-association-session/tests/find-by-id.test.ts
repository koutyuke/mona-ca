import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../shared/infra/drizzle";
import { AccountAssociationSessionTableHelper, UserTableHelper } from "../../../../../../shared/testing/helpers";
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

describe("AccountAssociationSessionRepository.findById", () => {
	beforeEach(async () => {
		await accountAssociationSessionTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	test("should return session from sessionId", async () => {
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: userRegistration.id,
			},
		});
		await accountAssociationSessionTableHelper.save(convertAccountAssociationSessionToRaw(accountAssociationSession));

		const foundSession = await accountAssociationSessionRepository.findById(accountAssociationSession.id);
		const expectedSession = convertAccountAssociationSessionToRaw(accountAssociationSession);

		expect(foundSession).toBeDefined();
		expect(expectedSession).toStrictEqual(convertAccountAssociationSessionToRaw(foundSession!));
	});

	test("should return null if session not found", async () => {
		const foundSession = await accountAssociationSessionRepository.findById(
			newAccountAssociationSessionId("wrongSessionId"),
		);
		expect(foundSession).toBeNull();
	});
});
