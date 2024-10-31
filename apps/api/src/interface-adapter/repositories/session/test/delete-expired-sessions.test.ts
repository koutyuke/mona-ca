import { env } from "cloudflare:test";
import { DrizzleService } from "@/infrastructure/drizzle";
import { SessionTableHelper, UserTableHelper } from "@/tests/helpers";
import { beforeAll, describe, expect, test } from "vitest";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

describe("SessionRepository.deleteExpiredSessions", () => {
	beforeAll(async () => {
		const expiredDate = new Date(sessionTableHelper.baseDatabaseSession.expires_at * 1000 - 3600 * 1000);

		await userTableHelper.create();

		await sessionTableHelper.create({
			...sessionTableHelper.baseDatabaseSession,
			expires_at: expiredDate.getTime() / 1000,
		});
	});

	test("should delete if session is expired", async () => {
		await sessionRepository.deleteExpiredSessions();

		const results = await sessionTableHelper.find(sessionTableHelper.baseDatabaseSession.id);
		expect(results).toHaveLength(0);
	});
});
