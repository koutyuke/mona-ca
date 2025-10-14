import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import type { ExternalIdentity } from "../../../../domain/entities";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { createExternalIdentityFixture, createUserFixture } from "../../../../tests/fixtures";
import { ExternalIdentityTableHelper, UserTableHelper } from "../../../../tests/helpers";
import { ExternalIdentityRepository } from "../external-identity.repository";

const { DB } = env;

const drizzleService = new DrizzleService(DB);
const externalIdentityRepository = new ExternalIdentityRepository(drizzleService);

const userTableHelper = new UserTableHelper(DB);
const externalIdentityTableHelper = new ExternalIdentityTableHelper(DB);

const { user } = createUserFixture();

describe("ExternalIdentityRepository.save", () => {
	beforeAll(async () => {
		await userTableHelper.save(user, null);
	});

	beforeEach(async () => {
		await externalIdentityTableHelper.deleteAll();
	});

	test("should set externalIdentity in the database", async () => {
		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: user.id,
			},
		});

		await externalIdentityRepository.save(externalIdentity);

		const results = await externalIdentityTableHelper.findByProviderAndProviderUserId(
			externalIdentity.provider,
			externalIdentity.providerUserId,
		);

		expect(results).toHaveLength(1);
		expect(results[0]).toStrictEqual(externalIdentityTableHelper.convertToRaw(externalIdentity));
	});

	test("should update externalIdentity in the database if it already exists", async () => {
		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: user.id,
			},
		});
		await externalIdentityTableHelper.save(externalIdentity);

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
		expect(results[0]).toStrictEqual(externalIdentityTableHelper.convertToRaw(updatedExternalIdentity));
	});
});
