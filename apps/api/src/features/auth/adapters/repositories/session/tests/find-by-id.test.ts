import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../shared/infra/drizzle";
import { SessionTableHelper, UserTableHelper } from "../../../../../../shared/testing/helpers";
import { newSessionId } from "../../../../domain/value-objects/ids";
import { createAuthUserFixture, createSessionFixture } from "../../../../testing/fixtures";
import { convertSessionToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

const { userRegistration } = createAuthUserFixture();

describe("SessionRepository.findById", () => {
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

	test("should return session and user from sessionId", async () => {
		const { session } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});
		await sessionTableHelper.save(convertSessionToRaw(session));

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
