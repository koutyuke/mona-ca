import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
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
const { userRegistration: userRegistration2 } = createAuthUserFixture({
	userRegistration: {
		email: "user2@example.com",
	},
});

describe("AccountAssociationSessionRepository.deleteExpiredSessions", () => {
	beforeEach(async () => {
		await accountAssociationSessionTableHelper.deleteAll();

		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration2));
	});

	test("should delete expired sessions but keep valid ones", async () => {
		const expiredSession = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: userRegistration.id,
				expiresAt: new Date(0),
			},
		});

		const validSession = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: userRegistration2.id,
			},
		});

		await accountAssociationSessionTableHelper.save(
			convertAccountAssociationSessionToRaw(expiredSession.accountAssociationSession),
		);
		await accountAssociationSessionTableHelper.save(
			convertAccountAssociationSessionToRaw(validSession.accountAssociationSession),
		);

		await accountAssociationSessionRepository.deleteExpiredSessions();

		const expiredSessionAfterDelete = await accountAssociationSessionTableHelper.findById(
			expiredSession.accountAssociationSession.id,
		);
		expect(expiredSessionAfterDelete).toHaveLength(0);

		const validSessionAfterDelete = await accountAssociationSessionTableHelper.findById(
			validSession.accountAssociationSession.id,
		);

		expect(validSessionAfterDelete).toHaveLength(1);
		expect(validSessionAfterDelete[0]).toStrictEqual(
			convertAccountAssociationSessionToRaw(validSession.accountAssociationSession),
		);
	});

	test("should do nothing when there are no expired sessions", async () => {
		const validSession = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: userRegistration2.id,
			},
		});

		await accountAssociationSessionTableHelper.save(
			convertAccountAssociationSessionToRaw(validSession.accountAssociationSession),
		);

		await accountAssociationSessionRepository.deleteExpiredSessions();

		const validSessionAfterDelete = await accountAssociationSessionTableHelper.findById(
			validSession.accountAssociationSession.id,
		);

		expect(validSessionAfterDelete).toHaveLength(1);
		expect(validSessionAfterDelete[0]).toStrictEqual(
			convertAccountAssociationSessionToRaw(validSession.accountAssociationSession),
		);
	});
});
