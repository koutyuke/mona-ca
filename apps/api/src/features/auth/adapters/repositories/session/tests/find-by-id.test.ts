import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { SessionsTableDriver, UsersTableDriver } from "../../../../../../core/testing/drivers";
import { newSessionId } from "../../../../domain/value-objects/ids";
import { convertSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/converters";
import { createAuthUserFixture, createSessionFixture } from "../../../../testing/fixtures";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableDriver = new UsersTableDriver(DB);
const sessionTableDriver = new SessionsTableDriver(DB);

const { userRegistration } = createAuthUserFixture();

describe("SessionRepository.findById", () => {
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

	test("should return session and user from sessionId", async () => {
		const { session } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});
		await sessionTableDriver.save(convertSessionToRaw(session));

		const foundSession = await sessionRepository.findById(session.id);
		const expectedSession = convertSessionToRaw(session);

		expect(foundSession).not.toBeNull();
		expect(convertSessionToRaw(foundSession!)).toStrictEqual(expectedSession);
	});

	test("should return null if session not found", async () => {
		const session = await sessionRepository.findById(newSessionId("wrongSessionId"));
		expect(session).toBeNull();
	});
});
