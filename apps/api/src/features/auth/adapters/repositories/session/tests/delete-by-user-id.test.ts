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

describe("SessionRepository.deleteByUserId", () => {
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

	test("should delete session from user if exists", async () => {
		const { session } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});
		await sessionTableDriver.save(convertSessionToRaw(session));

		await sessionRepository.deleteByUserId(userRegistration.id);

		const databaseSessions = await sessionTableDriver.findByUserId(userRegistration.id);
		expect(databaseSessions).toHaveLength(0);
	});
});
