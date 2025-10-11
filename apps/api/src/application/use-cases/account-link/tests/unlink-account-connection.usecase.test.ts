import { beforeEach, describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import { newOAuthProvider, newOAuthProviderId } from "../../../../domain/value-object";
import { createOAuthAccountFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	OAuthAccountRepositoryMock,
	UserRepositoryMock,
	createOAuthAccountKey,
	createOAuthAccountsMap,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import type { IUnlinkAccountConnectionUseCase } from "../../../ports/in";
import { UnlinkAccountConnectionUseCase } from "../unlink-account-connection.usecase";

describe("UnlinkAccountConnectionUseCase", () => {
	const sessionMap = createSessionsMap();
	const userMap = createUsersMap();
	const userPasswordHashMap = createUserPasswordHashMap();
	const oauthAccountMap = createOAuthAccountsMap();

	const userRepositoryMock = new UserRepositoryMock({
		userMap,
		userPasswordHashMap,
		sessionMap,
	});
	const oauthAccountRepositoryMock = new OAuthAccountRepositoryMock({ oauthAccountMap });
	const unlinkAccountConnectionUseCase: IUnlinkAccountConnectionUseCase = new UnlinkAccountConnectionUseCase(
		oauthAccountRepositoryMock,
		userRepositoryMock,
	);

	const { user, passwordHash } = createUserFixture();
	const provider = newOAuthProvider("discord");
	const providerId = newOAuthProviderId("discord_user_id");

	beforeEach(() => {
		sessionMap.clear();
		userMap.clear();
		userPasswordHashMap.clear();
		oauthAccountMap.clear();

		userMap.set(user.id, user);
		if (passwordHash) {
			userPasswordHashMap.set(user.id, passwordHash);
		}
	});

	it("should return ACCOUNT_NOT_LINKED error when user has no linked account for provider", async () => {
		userPasswordHashMap.set(user.id, passwordHash ?? "passwordHash");

		const result = await unlinkAccountConnectionUseCase.execute(provider, user.id);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("ACCOUNT_NOT_LINKED");
		}
	});

	it("should return PASSWORD_NOT_SET error when user has no password", async () => {
		const { oauthAccount } = createOAuthAccountFixture({
			oauthAccount: {
				userId: user.id,
				provider,
				providerId,
			},
		});

		userPasswordHashMap.clear();

		oauthAccountMap.set(createOAuthAccountKey(provider, providerId), oauthAccount);

		const result = await unlinkAccountConnectionUseCase.execute(provider, user.id);
		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("PASSWORD_NOT_SET");
		}
	});

	it("should successfully unlink account when user has password and linked account", async () => {
		const { oauthAccount } = createOAuthAccountFixture({
			oauthAccount: {
				userId: user.id,
				provider,
				providerId,
			},
		});

		userPasswordHashMap.set(user.id, passwordHash ?? "passwordHash");
		oauthAccountMap.set(createOAuthAccountKey(provider, providerId), oauthAccount);

		const result = await unlinkAccountConnectionUseCase.execute(provider, user.id);

		expect(isErr(result)).toBe(false);
		expect(oauthAccountMap.has(createOAuthAccountKey(provider, providerId))).toBe(false);
	});

	it("should return UNLINK_OPERATION_FAILED error when repository operation fails", async () => {
		const { oauthAccount } = createOAuthAccountFixture({
			oauthAccount: {
				userId: user.id,
				provider,
				providerId,
			},
		});

		userPasswordHashMap.set(user.id, passwordHash ?? "passwordHash");
		oauthAccountMap.set(createOAuthAccountKey(provider, providerId), oauthAccount);

		const originalDelete = oauthAccountRepositoryMock.deleteByUserIdAndProvider.bind(oauthAccountRepositoryMock);
		oauthAccountRepositoryMock.deleteByUserIdAndProvider = async () => {
			throw new Error("Database error");
		};

		const result = await unlinkAccountConnectionUseCase.execute(provider, user.id);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("UNLINK_OPERATION_FAILED");
		}

		oauthAccountRepositoryMock.deleteByUserIdAndProvider = originalDelete;
	});
});
