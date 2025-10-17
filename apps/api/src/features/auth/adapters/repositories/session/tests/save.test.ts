import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { createUserFixture } from "../../../../../../tests/fixtures";
import { createSessionFixture } from "../../../../../../tests/fixtures";
import { SessionTableHelper, UserTableHelper } from "../../../../../../tests/helpers";
import { sessionExpiresSpan } from "../../../../domain/entities";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

const { user } = createUserFixture();

describe("SessionRepository.save", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, null);
	});

	beforeEach(async () => {
		await DB.exec("DELETE FROM sessions");
	});

	test("should insert a session", async () => {
		const { session } = createSessionFixture({
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
		const { session } = createSessionFixture({
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
