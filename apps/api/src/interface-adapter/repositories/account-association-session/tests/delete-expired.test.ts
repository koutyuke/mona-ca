import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { newAccountAssociationSessionId, newUserId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import {
	AccountAssociationSessionTableHelper,
	type DatabaseAccountAssociationSession,
	UserTableHelper,
} from "../../../../tests/helpers";
import { toDatabaseDate } from "../../../../tests/utils";
import { AccountAssociationSessionRepository } from "../account-association-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const accountAssociationSessionTableHelper = new AccountAssociationSessionTableHelper(DB);

describe("AccountAssociationSessionRepository.deleteExpiredSessions", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await userTableHelper.create({
			...userTableHelper.baseDatabaseUser,
			id: newUserId("validUser"),
			name: "validUser",
			email: "valid.email@example.com",
		});
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM account_association_sessions");
	});

	test("should delete expired sessions but keep valid ones", async () => {
		const expiredSession = {
			...accountAssociationSessionTableHelper.baseDatabaseSession,
			expires_at: 0,
		} satisfies DatabaseAccountAssociationSession;

		const validSession = {
			...accountAssociationSessionTableHelper.baseDatabaseSession,
			id: newAccountAssociationSessionId("validSession"),
			user_id: "validUser",
			expires_at: toDatabaseDate(new Date(Date.now() + 1000 * 60 * 60 * 24)),
		} satisfies DatabaseAccountAssociationSession;

		await accountAssociationSessionTableHelper.create(expiredSession);
		await accountAssociationSessionTableHelper.create(validSession);

		await accountAssociationSessionRepository.deleteExpiredSessions();

		const expiredSessionAfterDelete = await accountAssociationSessionRepository.findById(
			newAccountAssociationSessionId(expiredSession.id),
		);
		expect(expiredSessionAfterDelete).toBeNull();

		const validSessionAfterDelete = await accountAssociationSessionRepository.findById(
			newAccountAssociationSessionId(validSession.id),
		);

		expect(validSessionAfterDelete).toStrictEqual(accountAssociationSessionTableHelper.toSession(validSession));
	});

	test("should do nothing when there are no expired sessions", async () => {
		const validSession = {
			...accountAssociationSessionTableHelper.baseDatabaseSession,
			id: newAccountAssociationSessionId("validSession"),
			user_id: "validUser",
			expires_at: toDatabaseDate(new Date(Date.now() + 1000 * 60 * 60 * 24)),
		} satisfies DatabaseAccountAssociationSession;

		await accountAssociationSessionTableHelper.create(validSession);

		await accountAssociationSessionRepository.deleteExpiredSessions();

		const validSessionAfterDelete = await accountAssociationSessionRepository.findById(
			newAccountAssociationSessionId(validSession.id),
		);
		expect(validSessionAfterDelete).toStrictEqual(accountAssociationSessionTableHelper.toSession(validSession));
	});
});
