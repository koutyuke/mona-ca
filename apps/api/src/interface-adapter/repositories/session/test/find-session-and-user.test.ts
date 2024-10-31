import { env } from "cloudflare:test";
import { Session } from "@/domain/session";
import { User } from "@/domain/user";
import { DrizzleService } from "@/infrastructure/drizzle";
import { SessionTableHelper, UserTableHelper } from "@/tests/helpers";
import { beforeAll, describe, expect, test } from "vitest";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

describe("SessionRepository.findSessionAndUser", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await sessionTableHelper.create();
	});

	test("should return session and user from sessionId", async () => {
		const { session, user } = await sessionRepository.findSessionAndUser(sessionTableHelper.baseDatabaseSession.id);

		const expectedSession = new Session(sessionTableHelper.baseSession);
		const expectedUser = new User(userTableHelper.baseUser);

		expect(user).toStrictEqual(expectedUser);
		expect(session).toStrictEqual(expectedSession);
	});

	test("should return null if session not found", async () => {
		const { session, user } = await sessionRepository.findSessionAndUser("wrongSessionId");
		expect(session).toBeNull();
		expect(user).toBeNull();
	});
});
