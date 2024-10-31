import { env } from "cloudflare:test";
import { Session } from "@/domain/session";
import { DrizzleService } from "@/infrastructure/drizzle";
import { SessionTableHelper, UserTableHelper } from "@/tests/helpers";
import { beforeAll, describe, expect, test } from "vitest";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

describe("SessionRepository.findUserSession", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await sessionTableHelper.create();
	});

	test("should return sessions", async () => {
		const sessions = await sessionRepository.findUserSessions(userTableHelper.baseDatabaseUser.id);

		const expectedSession = new Session(sessionTableHelper.baseSession);

		expect(sessions.length).toBe(1);
		expect(sessions[0]).toStrictEqual(expectedSession);
	});

	test("should return empty array if session not found", async () => {
		const sessions = await sessionRepository.findUserSessions("wrongUserId");
		expect(sessions).toHaveLength(0);
	});
});