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

describe("SessionRepository.delete", () => {
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

	test("should delete session if exists", async () => {
		const { session } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});
		await sessionTableHelper.save(convertSessionToRaw(session));

		await sessionRepository.deleteById(session.id);

		const databaseSessions = await sessionTableHelper.find(session.id);
		expect(databaseSessions).toHaveLength(0);
	});
});
