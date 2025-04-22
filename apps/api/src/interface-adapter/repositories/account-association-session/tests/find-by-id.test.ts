import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { newAccountAssociationSessionId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { AccountAssociationSessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { AccountAssociationSessionRepository } from "../account-association-session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const accountAssociationSessionTableHelper = new AccountAssociationSessionTableHelper(DB);

describe("AccountAssociationSessionRepository.findById", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await accountAssociationSessionTableHelper.create();
	});

	test("should return session from sessionId", async () => {
		const session = await accountAssociationSessionRepository.findById(
			accountAssociationSessionTableHelper.baseSession.id,
		);
		const expectedSession = accountAssociationSessionTableHelper.baseSession;

		expect(session).toStrictEqual(expectedSession);
	});

	test("should return null if session not found", async () => {
		const session = await accountAssociationSessionRepository.findById(
			newAccountAssociationSessionId("wrongSessionId"),
		);
		expect(session).toBeNull();
	});
});
