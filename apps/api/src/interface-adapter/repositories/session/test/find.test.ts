import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { Session } from "../../../../domain/session";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { SessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

describe("SessionRepository.find", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await sessionTableHelper.create();
	});

	test("should return session and user from sessionId", async () => {
		const session = await sessionRepository.find(sessionTableHelper.baseDatabaseSession.id);
		const expectedSession = new Session(sessionTableHelper.baseSession);

		expect(session).toStrictEqual(expectedSession);
	});

	test("should return null if session not found", async () => {
		const session = await sessionRepository.find("wrongSessionId");
		expect(session).toBeNull();
	});
});
