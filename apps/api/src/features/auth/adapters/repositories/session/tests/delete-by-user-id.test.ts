import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { SessionTableHelper, UserTableHelper } from "../../../../../../core/testing/helpers";
import { createAuthUserFixture, createSessionFixture } from "../../../../testing/fixtures";
import { convertSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

const { userRegistration } = createAuthUserFixture();

describe("SessionRepository.deleteByUserId", () => {
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

	test("should delete session from user if exists", async () => {
		const { session } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});
		await sessionTableHelper.save(convertSessionToRaw(session));

		await sessionRepository.deleteByUserId(userRegistration.id);

		const databaseSessions = await sessionTableHelper.findByUserId(userRegistration.id);
		expect(databaseSessions).toHaveLength(0);
	});
});
