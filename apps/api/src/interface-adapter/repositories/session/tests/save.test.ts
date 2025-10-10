import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { sessionExpiresSpan } from "../../../../domain/entities";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { SessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

const { user, passwordHash } = userTableHelper.createData();

describe("SessionRepository.save", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, passwordHash);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM sessions");
	});

	test("should insert a session", async () => {
		const { session } = sessionTableHelper.createData({
			session: {
				userId: user.id,
				expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds()),
			},
		});

		await sessionRepository.save(session);

		const databaseSessions = await sessionTableHelper.find(session.id);
		expect(databaseSessions).toHaveLength(1);
		expect(databaseSessions[0]).toStrictEqual(sessionTableHelper.convertToRaw(session));
	});

	test("should update session if it already exists", async () => {
		const { session } = sessionTableHelper.createData({
			session: {
				userId: user.id,
			},
		});
		await sessionTableHelper.save(session);

		const updatedSession = {
			...session,
			expiresAt: new Date(),
		};

		await sessionRepository.save(updatedSession);

		const databaseSessions = await sessionTableHelper.find(session.id);
		expect(databaseSessions).toHaveLength(1);
		expect(databaseSessions[0]).toStrictEqual(sessionTableHelper.convertToRaw(updatedSession));
	});
});
