import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../shared/infra/drizzle";
import { ExternalIdentityTableHelper, UserTableHelper } from "../../../../../../shared/testing/helpers";
import type { ExternalIdentityProvider } from "../../../../domain/value-objects/external-identity";
import {
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
} from "../../../../domain/value-objects/external-identity";
import { createAuthUserFixture, createExternalIdentityFixture } from "../../../../testing/fixtures";
import { convertExternalIdentityToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { ExternalIdentityRepository } from "../external-identity.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const externalIdentityRepository = new ExternalIdentityRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const externalIdentityTableHelper = new ExternalIdentityTableHelper(DB);

const { userRegistration } = createAuthUserFixture();

describe("ExternalIdentityRepository.findByProviderAndProviderId", () => {
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

	test("should return ExternalIdentity instance", async () => {
		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: userRegistration.id,
			},
		});
		await externalIdentityTableHelper.save(convertExternalIdentityToRaw(externalIdentity));

		const foundExternalIdentity = await externalIdentityRepository.findByProviderAndProviderUserId(
			externalIdentity.provider,
			externalIdentity.providerUserId,
		);

		expect(foundExternalIdentity).not.toBeNull();
		expect(convertExternalIdentityToRaw(foundExternalIdentity!)).toStrictEqual(
			convertExternalIdentityToRaw(externalIdentity),
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
