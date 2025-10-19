import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../shared/infra/drizzle";
import { ExternalIdentityTableHelper, UserTableHelper } from "../../../../../../shared/testing/helpers";
import { createAuthUserFixture, createExternalIdentityFixture } from "../../../../testing/fixtures";
import { convertExternalIdentityToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { ExternalIdentityRepository } from "../external-identity.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const externalIdentityRepository = new ExternalIdentityRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const externalIdentityTableHelper = new ExternalIdentityTableHelper(DB);

const { userRegistration } = createAuthUserFixture();

describe("ExternalIdentityRepository.deleteByUserIdAndProvider", () => {
	beforeEach(async () => {
		await externalIdentityTableHelper.deleteAll();
	});

	beforeAll(async () => {
		await userTableHelper.save(convertUserRegistrationToRaw(userRegistration));
	});

	afterAll(async () => {
		await userTableHelper.deleteAll();
		await externalIdentityTableHelper.deleteAll();
	});

	test("should delete date in database", async () => {
		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: userRegistration.id,
			},
		});
		await externalIdentityTableHelper.save(convertExternalIdentityToRaw(externalIdentity));

		await externalIdentityRepository.deleteByUserIdAndProvider(externalIdentity.userId, externalIdentity.provider);
		const results = await externalIdentityTableHelper.findByUserIdAndProvider(
			externalIdentity.userId,
			externalIdentity.provider,
		);
		expect(results).toHaveLength(0);
	});
});
