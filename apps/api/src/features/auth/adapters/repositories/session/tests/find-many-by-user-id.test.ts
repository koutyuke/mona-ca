import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
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

describe("SessionRepository.findManyByUserId", () => {
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

	test("should return sessions", async () => {
		const firstSession = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});
		const secondSession = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});

		await sessionTableDriver.save(convertSessionToRaw(firstSession.session));
		await sessionTableDriver.save(convertSessionToRaw(secondSession.session));

		const sessions = await sessionRepository.findManyByUserId(userRegistration.id);

		expect(sessions).toHaveLength(2);
		expect(sessions.map(convertSessionToRaw)).toStrictEqual([
			convertSessionToRaw(firstSession.session),
			convertSessionToRaw(secondSession.session),
		]);
	});

	test("should return empty array if session not found", async () => {
		const sessions = await sessionRepository.findManyByUserId(newUserId("wrongUserId"));
		expect(sessions).toHaveLength(0);
	});
});
