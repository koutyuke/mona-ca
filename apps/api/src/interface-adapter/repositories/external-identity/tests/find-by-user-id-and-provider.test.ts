import { env } from "cloudflare:test";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";
import { newExternalIdentityProvider, newUserId } from "../../../../domain/value-objects";
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

describe("ExternalIdentityRepository.findByUserIdAndProvider", () => {
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

		const foundExternalIdentity = await externalIdentityRepository.findByUserIdAndProvider(
			externalIdentity.userId,
			externalIdentity.provider,
		);

		expect(foundExternalIdentity).not.toBeNull();
		expect(externalIdentityTableHelper.convertToRaw(foundExternalIdentity!)).toStrictEqual(
			externalIdentityTableHelper.convertToRaw(externalIdentity),
		);
	});

	test("should return null if ExternalIdentity not found", async () => {
		const invalidExternalIdentity = await externalIdentityRepository.findByUserIdAndProvider(
			newUserId("invalidId"),
			newExternalIdentityProvider("discord"),
		);
		expect(invalidExternalIdentity).toBeNull();
	});
});
