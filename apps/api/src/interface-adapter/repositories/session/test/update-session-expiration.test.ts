import { env } from "cloudflare:test";
import { DrizzleService } from "@/infrastructure/drizzle";
import { SessionTableHelper, UserTableHelper } from "@/tests/helpers";
import { beforeAll, describe, expect, test } from "vitest";
import { SessionRepository } from "../session.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const sessionRepository = new SessionRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const sessionTableHelper = new SessionTableHelper(DB);

describe("SessionRepository.updateSessionExpiration", () => {
	beforeAll(async () => {
		await userTableHelper.create();
		await sessionTableHelper.create();
	});

	test("should update session expiresAt", async () => {
		const newExpiresAt = new Date(sessionTableHelper.baseDatabaseSession.expires_at * 1000 + 3600 * 1000);

		await sessionRepository.updateSessionExpiration(sessionTableHelper.baseDatabaseSession.id, newExpiresAt);

		const results = await sessionTableHelper.find(sessionTableHelper.baseDatabaseSession.id);

		expect(results).toHaveLength(1);
		expect(results[0]!.expires_at).toBe(newExpiresAt.getTime() / 1000);
	});
});
