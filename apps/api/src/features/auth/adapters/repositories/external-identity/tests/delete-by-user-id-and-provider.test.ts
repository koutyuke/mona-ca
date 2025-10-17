import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { createExternalIdentityFixture, createUserFixture } from "../../../../../../tests/fixtures";
import { ExternalIdentityTableHelper, UserTableHelper } from "../../../../../../tests/helpers";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { ExternalIdentityRepository } from "../external-identity.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const externalIdentityRepository = new ExternalIdentityRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const externalIdentityTableHelper = new ExternalIdentityTableHelper(DB);

const { user } = createUserFixture();

describe("ExternalIdentityRepository.deleteByUserIdAndProvider", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, null);
	});

	beforeEach(async () => {
		await externalIdentityTableHelper.deleteAll();
	});

	test("should delete date in database", async () => {
		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: user.id,
			},
		});
		await externalIdentityTableHelper.save(externalIdentity);

		await externalIdentityRepository.deleteByUserIdAndProvider(externalIdentity.userId, externalIdentity.provider);
		const results = await externalIdentityTableHelper.findByUserIdAndProvider(
			externalIdentity.userId,
			externalIdentity.provider,
		);
		expect(results).toHaveLength(0);
	});
});
