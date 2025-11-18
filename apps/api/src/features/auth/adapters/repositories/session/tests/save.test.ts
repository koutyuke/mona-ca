import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { SessionsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { sessionExpiresSpan } from "../../../../domain/entities/session";
import { createAuthUserFixture, createSessionFixture } from "../../../../testing/fixtures";
import { convertSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/libs";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const sessionTableDriver = new SessionsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("SessionRepository.save", () => {
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

	test("should insert a session", async () => {
		const { session } = createSessionFixture({
			session: {
				userId: userRegistration.id,
				expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds()),
			},
		});

		await sessionRepository.save(session);

		const databaseSessions = await sessionTableDriver.find(session.id);
		expect(databaseSessions).toHaveLength(1);
		expect(databaseSessions[0]).toStrictEqual(convertSessionToRaw(session));
	});

	test("should update session if it already exists", async () => {
		const { session } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});
		await sessionTableDriver.save(convertSessionToRaw(session));

		const updatedSession = {
			...session,
			expiresAt: new Date(),
		};

		await sessionRepository.save(updatedSession);

		const databaseSessions = await sessionTableDriver.find(session.id);
		expect(databaseSessions).toHaveLength(1);
		expect(databaseSessions[0]).toStrictEqual(convertSessionToRaw(updatedSession));
	});
});
