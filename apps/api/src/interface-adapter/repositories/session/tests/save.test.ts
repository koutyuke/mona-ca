import { env } from "cloudflare:test";
import { beforeAll, describe, expect, test } from "vitest";
import { sessionExpiresSpan } from "../../../../common/constants";
import { Session } from "../../../../domain/entities";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { SessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { toDatabaseDate } from "../../../../tests/utils";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

describe("SessionRepository.save", () => {
	beforeAll(async () => {
		await userTableHelper.create();
	});

	test("should set session in the database", async () => {
		await sessionRepository.save(sessionTableHelper.baseSession);

		const results = await sessionTableHelper.find(sessionTableHelper.baseDatabaseSession.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(sessionTableHelper.baseDatabaseSession);
	});

	test("should update session in the database if it already exists", async () => {
		await sessionTableHelper.create();

		const newExpiresAt = new Date(Date.now() + sessionExpiresSpan.milliseconds());

		const updatedSession = new Session({
			id: sessionTableHelper.baseSession.id,
			userId: sessionTableHelper.baseSession.userId,
			expiresAt: newExpiresAt,
		});

		await sessionRepository.save(updatedSession);

		const results = await sessionTableHelper.find(sessionTableHelper.baseDatabaseSession.id);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual({
			id: sessionTableHelper.baseDatabaseSession.id,
			user_id: sessionTableHelper.baseDatabaseSession.user_id,
			expires_at: toDatabaseDate(newExpiresAt),
		});
	});
});
