import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { createSessionFixture, createUserFixture } from "../../../../../../tests/fixtures";
import { SessionTableHelper, UserTableHelper } from "../../../../../../tests/helpers";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

const { user } = createUserFixture();

describe("SessionRepository.deleteByExpired", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, null);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM sessions");
	});

	test("should delete if session is expired", async () => {
		const expiredSession = createSessionFixture({
			session: {
				userId: user.id,
				expiresAt: new Date(0),
			},
		});
		const validSession = createSessionFixture({
			session: {
				userId: user.id,
			},
		});

		await sessionTableHelper.save(expiredSession.session);
		await sessionTableHelper.save(validSession.session);

		await sessionRepository.deleteExpiredSessions();

		const expiredSessions = await sessionTableHelper.find(expiredSession.session.id);
		expect(expiredSessions).toHaveLength(0);

		const validSessions = await sessionTableHelper.find(validSession.session.id);
		expect(validSessions).toHaveLength(1);
		expect(validSessions[0]).toStrictEqual(sessionTableHelper.convertToRaw(validSession.session));
	});
});
