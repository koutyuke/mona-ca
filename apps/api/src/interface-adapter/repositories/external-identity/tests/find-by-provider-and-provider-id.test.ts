import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import {
	type ExternalIdentityProvider,
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
} from "../../../../domain/value-objects";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { createUserFixture } from "../../../../tests/fixtures";
import { createExternalIdentityFixture } from "../../../../tests/fixtures";
import { ExternalIdentityTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { ExternalIdentityRepository } from "../external-identity.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const externalIdentityRepository = new ExternalIdentityRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const externalIdentityTableHelper = new ExternalIdentityTableHelper(DB);

const { user } = createUserFixture();

describe("ExternalIdentityRepository.findByProviderAndProviderId", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, null);
	});

	beforeEach(async () => {
		await externalIdentityTableHelper.deleteAll();
	});

	test("should return ExternalIdentity instance", async () => {
		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: user.id,
			},
		});
		await externalIdentityTableHelper.save(externalIdentity);

		const foundExternalIdentity = await externalIdentityRepository.findByProviderAndProviderUserId(
			externalIdentity.provider,
			externalIdentity.providerUserId,
		);

		expect(foundExternalIdentity).not.toBeNull();
		expect(externalIdentityTableHelper.convertToRaw(foundExternalIdentity!)).toStrictEqual(
			externalIdentityTableHelper.convertToRaw(externalIdentity),
		);
	});

	test("should return null if ExternalIdentity not found", async () => {
		const invalidExternalIdentity = await externalIdentityRepository.findByProviderAndProviderUserId(
			newExternalIdentityProvider("invalidProvider" as ExternalIdentityProvider),
			newExternalIdentityProviderUserId("invalidProviderId"),
		);
		expect(invalidExternalIdentity).toBeNull();
	});
});
