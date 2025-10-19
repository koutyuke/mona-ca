import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../shared/infra/drizzle";
import { SessionTableHelper, UserTableHelper } from "../../../../../../shared/testing/helpers";
import { createAuthUserFixture, createSessionFixture } from "../../../../testing/fixtures";
import { convertSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

const { userRegistration } = createAuthUserFixture();

describe("SessionRepository.deleteByExpired", () => {
	beforeEach(async () => {
		await sessionTableHelper.deleteAll();
	});

	beforeAll(async () => {
		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	afterAll(async () => {
		await userTableHelper.deleteAll();
		await sessionTableHelper.deleteAll();
	});

	test("should delete if session is expired", async () => {
		const expiredSession = createSessionFixture({
			session: {
				userId: userRegistration.id,
				expiresAt: new Date(0),
			},
		});
		const validSession = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});

		await sessionTableHelper.save(convertSessionToRaw(expiredSession.session));
		await sessionTableHelper.save(convertSessionToRaw(validSession.session));

		await sessionRepository.deleteExpiredSessions();

		const expiredSessions = await sessionTableHelper.find(expiredSession.session.id);
		expect(expiredSessions).toHaveLength(0);

		const validSessions = await sessionTableHelper.find(validSession.session.id);
		expect(validSessions).toHaveLength(1);
		expect(validSessions[0]).toStrictEqual(convertSessionToRaw(validSession.session));
	});
});
