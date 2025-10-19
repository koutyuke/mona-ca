import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { newUserId } from "../../../../../../shared/domain/value-objects";
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

describe("SessionRepository.findManyByUserId", () => {
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

		await sessionTableHelper.save(convertSessionToRaw(firstSession.session));
		await sessionTableHelper.save(convertSessionToRaw(secondSession.session));

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
