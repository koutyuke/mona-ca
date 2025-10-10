import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { newAccountAssociationSessionId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { AccountAssociationSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { AccountAssociationSessionRepository } from "../account-association-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const accountAssociationSessionTableHelper = new AccountAssociationSessionTableHelper(DB);

const { user, passwordHash } = userTableHelper.createData();

describe("AccountAssociationSessionRepository.findById", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, passwordHash);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM account_association_sessions");
	});

	test("should return session from sessionId", async () => {
		const { session } = accountAssociationSessionTableHelper.createData({
			session: {
				userId: user.id,
			},
		});
		await accountAssociationSessionTableHelper.save(session);

		const foundSession = await accountAssociationSessionRepository.findById(session.id);
		const expectedSession = accountAssociationSessionTableHelper.convertToRaw(session);

		expect(foundSession).toBeDefined();
		expect(expectedSession).toStrictEqual(accountAssociationSessionTableHelper.convertToRaw(foundSession!));
	});

	test("should return null if session not found", async () => {
		const foundSession = await accountAssociationSessionRepository.findById(
			newAccountAssociationSessionId("wrongSessionId"),
		);
		expect(foundSession).toBeNull();
	});
});
