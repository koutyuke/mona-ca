import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { SessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB, {
	expiresAt: new Date(0),
});

describe("SessionRepository.deleteByExpired", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await sessionTableHelper.create();
	});

	test("should delete if session is expired", async () => {
		await sessionRepository.deleteExpiredSessions();

		const results = await sessionTableHelper.find(sessionTableHelper.baseDatabaseData.id);
		expect(results).toHaveLength(0);
	});
});
