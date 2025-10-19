import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../shared/infra/drizzle";
import { SessionTableHelper, UserTableHelper } from "../../../../../../shared/testing/helpers";
import { sessionExpiresSpan } from "../../../../domain/entities/session";
import { createAuthUserFixture, createSessionFixture } from "../../../../testing/fixtures";
import { convertSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

const { userRegistration } = createAuthUserFixture();

describe("SessionRepository.save", () => {
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

	test("should insert a session", async () => {
		const { session } = createSessionFixture({
			session: {
				userId: userRegistration.id,
				expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds()),
			},
		});

		await sessionRepository.save(session);

		const databaseSessions = await sessionTableHelper.find(session.id);
		expect(databaseSessions).toHaveLength(1);
		expect(databaseSessions[0]).toStrictEqual(convertSessionToRaw(session));
	});

	test("should update session if it already exists", async () => {
		const { session } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});
		await sessionTableHelper.save(convertSessionToRaw(session));

		const updatedSession = {
			...session,
			expiresAt: new Date(),
		};

		await sessionRepository.save(updatedSession);

		const databaseSessions = await sessionTableHelper.find(session.id);
		expect(databaseSessions).toHaveLength(1);
		expect(databaseSessions[0]).toStrictEqual(convertSessionToRaw(updatedSession));
	});
});
