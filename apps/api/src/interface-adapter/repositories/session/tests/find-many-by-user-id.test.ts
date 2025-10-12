import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../domain/value-object";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { createSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import { SessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

const { user } = createUserFixture();

describe("SessionRepository.findManyByUserId", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, null);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM sessions");
	});

	test("should return sessions", async () => {
		const firstSession = createSessionFixture({
			session: {
				userId: user.id,
			},
		});
		const secondSession = createSessionFixture({
			session: {
				userId: user.id,
			},
		});

		await sessionTableHelper.save(firstSession.session);
		await sessionTableHelper.save(secondSession.session);

		const sessions = await sessionRepository.findManyByUserId(user.id);

		expect(sessions).toHaveLength(2);
		expect(sessions.map(sessionTableHelper.convertToRaw)).toStrictEqual([
			sessionTableHelper.convertToRaw(firstSession.session),
			sessionTableHelper.convertToRaw(secondSession.session),
		]);
	});

	test("should return empty array if session not found", async () => {
		const sessions = await sessionRepository.findManyByUserId(newUserId("wrongUserId"));
		expect(sessions).toHaveLength(0);
	});
});
