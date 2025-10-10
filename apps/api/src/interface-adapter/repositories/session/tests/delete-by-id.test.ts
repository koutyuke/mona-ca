import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { SessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

const { user, passwordHash } = userTableHelper.createData();

describe("SessionRepository.delete", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, passwordHash);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM sessions");
	});

	test("should delete session if exists", async () => {
		const { session } = sessionTableHelper.createData({
			session: {
				userId: user.id,
			},
		});
		await sessionTableHelper.save(session);

		await sessionRepository.deleteById(session.id);

		const databaseSessions = await sessionTableHelper.find(session.id);
		expect(databaseSessions).toHaveLength(0);
	});
});
