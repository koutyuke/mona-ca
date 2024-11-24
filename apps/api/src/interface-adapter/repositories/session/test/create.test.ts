import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { SessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

describe("SessionRepository.create", () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	test("should create session in the database", async () => {
		await sessionRepository.create(sessionTableHelper.baseSession);

		const results = await sessionTableHelper.find(sessionTableHelper.baseDatabaseSession.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(sessionTableHelper.baseDatabaseSession);
	});
});
