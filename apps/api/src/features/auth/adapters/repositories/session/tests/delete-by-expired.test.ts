import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { SessionsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { convertSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAuthUserFixture, createSessionFixture } from "../../../../testing/fixtures";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const sessionTableDriver = new SessionsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("SessionRepository.deleteByExpired", () => {
	beforeEach(async () => {
		await sessionTableDriver.deleteAll();
	});

	beforeAll(async () => {
		await userTableDriver.save(convertUserRegistrationToRaw(userRegistration));
	});

	afterAll(async () => {
		await userTableDriver.deleteAll();
		await sessionTableDriver.deleteAll();
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

		await sessionTableDriver.save(convertSessionToRaw(expiredSession.session));
		await sessionTableDriver.save(convertSessionToRaw(validSession.session));

		await sessionRepository.deleteExpiredSessions();

		const expiredSessions = await sessionTableDriver.find(expiredSession.session.id);
		expect(expiredSessions).toHaveLength(0);

		const validSessions = await sessionTableDriver.find(validSession.session.id);
		expect(validSessions).toHaveLength(1);
		expect(validSessions[0]).toStrictEqual(convertSessionToRaw(validSession.session));
	});
});
