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

describe("SessionRepository.deleteByUserId", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, null);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM sessions");
	});

	test("should delete session from user if exists", async () => {
		const { session } = createSessionFixture({
			session: {
				userId: user.id,
			},
		});
		await sessionTableHelper.save(session);

		await sessionRepository.deleteByUserId(user.id);

		const databaseSessions = await sessionTableHelper.findByUserId(user.id);
		expect(databaseSessions).toHaveLength(0);
	});
});
