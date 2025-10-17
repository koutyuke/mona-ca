import { beforeEach, describe, expect, it } from "vitest";
import type { IUnlinkAccountConnectionUseCase } from "../../../../../../application/ports/in";
import {
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
} from "../../../../../../common/domain/value-objects";
import { createExternalIdentityFixture, createUserFixture } from "../../../../../../tests/fixtures";
import {
	ExternalIdentityRepositoryMock,
	PasswordHasherMock,
	UserRepositoryMock,
	createExternalIdentitiesMap,
	createExternalIdentityKey,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../../../tests/mocks";
import { UnlinkAccountConnectionUseCase } from "../unlink-account-connection.usecase";

const sessionMap = createSessionsMap();
const userMap = createUsersMap();
const userPasswordHashMap = createUserPasswordHashMap();
const externalIdentityMap = createExternalIdentitiesMap();

const passwordHasher = new PasswordHasherMock();

const userRepository = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
	sessionMap,
});
const externalIdentityRepository = new ExternalIdentityRepositoryMock({ externalIdentityMap });

const unlinkAccountConnectionUseCase: IUnlinkAccountConnectionUseCase = new UnlinkAccountConnectionUseCase(
	externalIdentityRepository,
	userRepository,
);

const { user } = createUserFixture();
const password = "password123";
const passwordHash = await passwordHasher.hash(password);
const provider = newExternalIdentityProvider("discord");
const providerUserId = newExternalIdentityProviderUserId("discord_user_id");

describe("UnlinkAccountConnectionUseCase", () => {
	beforeEach(() => {
		sessionMap.clear();
		userMap.clear();
		userPasswordHashMap.clear();
		externalIdentityMap.clear();

		userMap.set(user.id, user);
		if (passwordHash) {
			userPasswordHashMap.set(user.id, passwordHash);
		}
	});

	it("should return PROVIDER_NOT_LINKED error when user has no linked account for provider", async () => {
		userPasswordHashMap.set(user.id, passwordHash ?? "passwordHash");

		const result = await unlinkAccountConnectionUseCase.execute(provider, user.id);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("PROVIDER_NOT_LINKED");
		}
	});

	it("should return PASSWORD_NOT_SET error when user has no password", async () => {
		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: user.id,
				provider,
				providerUserId,
			},
		});

		userPasswordHashMap.clear();

		externalIdentityMap.set(createExternalIdentityKey(provider, providerUserId), externalIdentity);

		const result = await unlinkAccountConnectionUseCase.execute(provider, user.id);
		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("PASSWORD_NOT_SET");
		}
	});

	it("should successfully unlink account when user has password and linked account", async () => {
		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: user.id,
				provider,
				providerUserId,
			},
		});

		userPasswordHashMap.set(user.id, passwordHash ?? "passwordHash");
		externalIdentityMap.set(createExternalIdentityKey(provider, providerUserId), externalIdentity);

		const result = await unlinkAccountConnectionUseCase.execute(provider, user.id);

		expect(result.isErr).toBe(false);
		expect(externalIdentityMap.has(createExternalIdentityKey(provider, providerUserId))).toBe(false);
	});

	it("should return UNLINK_OPERATION_FAILED error when repository operation fails", async () => {
		const { externalIdentity } = createExternalIdentityFixture({
			externalIdentity: {
				userId: user.id,
				provider,
				providerUserId,
			},
		});

		userPasswordHashMap.set(user.id, passwordHash ?? "passwordHash");
		externalIdentityMap.set(createExternalIdentityKey(provider, providerUserId), externalIdentity);

		const originalDelete = externalIdentityRepository.deleteByUserIdAndProvider.bind(externalIdentityRepository);
		externalIdentityRepository.deleteByUserIdAndProvider = async () => {
			throw new Error("Database error");
		};

		const result = await unlinkAccountConnectionUseCase.execute(provider, user.id);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("UNLINK_OPERATION_FAILED");
		}

		externalIdentityRepository.deleteByUserIdAndProvider = originalDelete;
	});
});
