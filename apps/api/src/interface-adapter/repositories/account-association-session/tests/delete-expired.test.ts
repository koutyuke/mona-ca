import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { createAccountAssociationSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import { AccountAssociationSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { AccountAssociationSessionRepository } from "../account-association-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const accountAssociationSessionTableHelper = new AccountAssociationSessionTableHelper(DB);

const { user, passwordHash } = createUserFixture();
const { user: user2, passwordHash: passwordHash2 } = createUserFixture({
	user: {
		email: "user2@example.com",
	},
});

describe("AccountAssociationSessionRepository.deleteExpiredSessions", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, passwordHash);
		await userTableHelper.save(user2, passwordHash2);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM account_association_sessions");
	});

	test("should delete expired sessions but keep valid ones", async () => {
		const expiredSession = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				expiresAt: new Date(0),
			},
		});

		const validSession = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user2.id,
			},
		});

		await accountAssociationSessionTableHelper.save(expiredSession.accountAssociationSession);
		await accountAssociationSessionTableHelper.save(validSession.accountAssociationSession);

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
			accountAssociationSessionTableHelper.convertToRaw(validSession.accountAssociationSession),
		);
	});

	test("should do nothing when there are no expired sessions", async () => {
		const validSession = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user2.id,
			},
		});

		await accountAssociationSessionTableHelper.save(validSession.accountAssociationSession);

		await accountAssociationSessionRepository.deleteExpiredSessions();

		const validSessionAfterDelete = await accountAssociationSessionTableHelper.findById(
			validSession.accountAssociationSession.id,
		);

		expect(validSessionAfterDelete).toHaveLength(1);
		expect(validSessionAfterDelete[0]).toStrictEqual(
			accountAssociationSessionTableHelper.convertToRaw(validSession.accountAssociationSession),
		);
	});
});
