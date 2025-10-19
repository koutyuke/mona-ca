import { beforeEach, describe, expect, it } from "vitest";
import {
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
} from "../../../../domain/value-objects/external-identity";
import { createAuthUserFixture, createExternalIdentityFixture } from "../../../../testing/fixtures";
import {
	ExternalIdentityRepositoryMock,
	createExternalIdentitiesMap,
	createExternalIdentityKey,
} from "../../../../testing/mocks/repositories";
import type { IUnlinkAccountConnectionUseCase } from "../../../contracts/account-link/unlink-account-connection.usecase.interface";
import { UnlinkAccountConnectionUseCase } from "../unlink-account-connection.usecase";

const externalIdentityMap = createExternalIdentitiesMap();

const externalIdentityRepository = new ExternalIdentityRepositoryMock({ externalIdentityMap });

const unlinkAccountConnectionUseCase: IUnlinkAccountConnectionUseCase = new UnlinkAccountConnectionUseCase(
	externalIdentityRepository,
);

const { userIdentity } = createAuthUserFixture();
const provider = newExternalIdentityProvider("discord");
const providerUserId = newExternalIdentityProviderUserId("discord_user_id");

describe("UnlinkAccountConnectionUseCase", () => {
	beforeEach(() => {
		externalIdentityMap.clear();
	});

	it("should return PROVIDER_NOT_LINKED error when user has no linked account for provider", async () => {
		const result = await unlinkAccountConnectionUseCase.execute(provider, userIdentity);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("PROVIDER_NOT_LINKED");
		}
	});

	it("should return PASSWORD_NOT_SET error when user has no password", async () => {
		const { userIdentity } = createAuthUserFixture();
		const userWithoutPassword = {
			...userIdentity,
			passwordHash: null,
		};

		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: userWithoutPassword.id,
				provider,
				providerUserId,
			},
		});

		externalIdentityMap.set(createExternalIdentityKey(provider, providerUserId), externalIdentity);

		const result = await unlinkAccountConnectionUseCase.execute(provider, userWithoutPassword);
		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("PASSWORD_NOT_SET");
		}
	});

	it("should successfully unlink account when user has password and linked account", async () => {
		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: userIdentity.id,
				provider,
				providerUserId,
			},
		});

		externalIdentityMap.set(createExternalIdentityKey(provider, providerUserId), externalIdentity);

		const result = await unlinkAccountConnectionUseCase.execute(provider, userIdentity);

		expect(result.isErr).toBe(false);
		expect(externalIdentityMap.has(createExternalIdentityKey(provider, providerUserId))).toBe(false);
	});
});
