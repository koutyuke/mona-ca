import { env } from "cloudflare:test";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { DrizzleService } from "../../../../../../core/infra/drizzle";
import { ExternalIdentityTableHelper, UserTableHelper } from "../../../../../../core/testing/helpers";
import type { ExternalIdentity } from "../../../../domain/entities/external-identity";
import { createAuthUserFixture, createExternalIdentityFixture } from "../../../../testing/fixtures";
import { convertExternalIdentityToRaw, convertUserRegistrationToRaw } from "../../../../testing/helpers";
import { ExternalIdentityRepository } from "../external-identity.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const externalIdentityRepository = new ExternalIdentityRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const externalIdentityTableHelper = new ExternalIdentityTableHelper(DB);

const { userRegistration } = createAuthUserFixture();

describe("ExternalIdentityRepository.save", () => {
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

	test("should set externalIdentity in the database", async () => {
		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: userRegistration.id,
			},
		});

		await externalIdentityRepository.save(externalIdentity);

		const results = await externalIdentityTableHelper.findByProviderAndProviderUserId(
			externalIdentity.provider,
			externalIdentity.providerUserId,
		);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(convertExternalIdentityToRaw(externalIdentity));
	});

	test("should update externalIdentity in the database if it already exists", async () => {
		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: userRegistration.id,
			},
		});
		await externalIdentityTableHelper.save(convertExternalIdentityToRaw(externalIdentity));

		const updatedExternalIdentity = {
			...externalIdentity,
			linkedAt: new Date("2024-01-01T00:00:00.000Z"),
		} satisfies ExternalIdentity;

		await externalIdentityRepository.save(updatedExternalIdentity);

		const results = await externalIdentityTableHelper.findByProviderAndProviderUserId(
			externalIdentity.provider,
			externalIdentity.providerUserId,
		);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(convertExternalIdentityToRaw(updatedExternalIdentity));
	});
});
