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

describe("SessionRepository.delete", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await sessionTableHelper.create();
	});

	test("should delete session if exists", async () => {
		await sessionRepository.delete(sessionTableHelper.baseDatabaseSession.id);

		const results = await sessionTableHelper.find(sessionTableHelper.baseDatabaseSession.id);

		expect(results).toHaveLength(0);
	});
});