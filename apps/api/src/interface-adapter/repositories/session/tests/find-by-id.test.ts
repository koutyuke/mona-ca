import { env } from "cloudflare:test";
import { beforeEach, describe, expect, test } from "vitest";
import { newSessionId } from "../../../../domain/value-objects";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { createSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import { SessionTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

describe("SessionRepository.findById", () => {
	beforeEach(async () => {
		await DB.exec("DELETE FROM sessions");
		await DB.exec("DELETE FROM users");
	});

	test("should return session and user from sessionId", async () => {
		const { user } = createUserFixture();
		await userTableHelper.save(user, null);

		const { session } = createSessionFixture({
			session: {
				userId: user.id,
			},
		});
		await sessionTableHelper.save(session);

		const foundSession = await sessionRepository.findById(session.id);
		const expectedSession = sessionTableHelper.convertToRaw(session);

		expect(foundSession).not.toBeNull();
		expect(sessionTableHelper.convertToRaw(foundSession!)).toStrictEqual(expectedSession);
	});

	test("should return null if session not found", async () => {
		const session = await sessionRepository.findById(newSessionId("wrongSessionId"));
		expect(session).toBeNull();
	});
});
