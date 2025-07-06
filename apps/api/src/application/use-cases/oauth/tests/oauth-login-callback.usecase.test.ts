import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { DEFAULT_USER_GENDER, createOAuthAccount, createUser } from "../../../../domain/entities";
import {
	newClientType,
	newGender,
	newOAuthProvider,
	newOAuthProviderId,
	newUserId,
} from "../../../../domain/value-object";
import { generateSignedState } from "../../../../interface-adapter/gateway/oauth-provider";
import {
	AccountAssociationSessionRepositoryMock,
	OAuthAccountRepositoryMock,
	OAuthProviderGatewayMock,
	SessionRepositoryMock,
	SessionSecretServiceMock,
	UserRepositoryMock,
	createAccountAssociationSessionsMap,
	createOAuthAccountKey,
	createOAuthAccountsMap,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import type { IOAuthLoginCallbackUseCase } from "../interfaces/oauth-login-callback.usecase.interface";
import { OAuthLoginCallbackUseCase } from "../oauth-login-callback.usecase";

describe("OAuthLoginCallbackUseCase", () => {
	const mockEnv = {
		APP_ENV: "development" as const,
		OAUTH_STATE_HMAC_SECRET: "test_secret",
	};

	let oauthLoginCallbackUseCase: IOAuthLoginCallbackUseCase;
	let userRepositoryMock: UserRepositoryMock;
	let sessionRepositoryMock: SessionRepositoryMock;
	let oauthAccountRepositoryMock: OAuthAccountRepositoryMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;
	let oauthProviderGatewayMock: OAuthProviderGatewayMock;
	let accountAssociationSessionRepositoryMock: AccountAssociationSessionRepositoryMock;

	beforeEach(() => {
		const userMap = createUsersMap();
		const sessionMap = createSessionsMap();
		const userPasswordHashMap = createUserPasswordHashMap();
		const oauthAccountMap = createOAuthAccountsMap();
		const accountAssociationSessionMap = createAccountAssociationSessionsMap();

		sessionSecretServiceMock = new SessionSecretServiceMock();
		oauthProviderGatewayMock = new OAuthProviderGatewayMock();
		sessionRepositoryMock = new SessionRepositoryMock({ sessionMap });
		oauthAccountRepositoryMock = new OAuthAccountRepositoryMock({ oauthAccountMap });
		userRepositoryMock = new UserRepositoryMock({
			userMap,
			userPasswordHashMap,
			sessionMap,
		});
		accountAssociationSessionRepositoryMock = new AccountAssociationSessionRepositoryMock({
			accountAssociationSessionMap,
		});

		oauthLoginCallbackUseCase = new OAuthLoginCallbackUseCase(
			mockEnv,
			sessionSecretServiceMock,
			oauthProviderGatewayMock,
			sessionRepositoryMock,
			oauthAccountRepositoryMock,
			userRepositoryMock,
			accountAssociationSessionRepositoryMock,
		);
	});

	it("should return INVALID_OAUTH_STATE error for invalid state", async () => {
		const invalidState = "invalid_state";
		const provider = newOAuthProvider("discord");

		const result = await oauthLoginCallbackUseCase.execute(
			undefined,
			"/dashboard",
			provider,
			invalidState,
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("INVALID_OAUTH_STATE");
		}
	});

	it("should return INVALID_REDIRECT_URL error for invalid redirect URI", async () => {
		const signedState = generateSignedState({ client: newClientType("web") }, mockEnv.OAUTH_STATE_HMAC_SECRET);
		const provider = newOAuthProvider("discord");

		const result = await oauthLoginCallbackUseCase.execute(
			undefined,
			"https://malicious.com/redirect",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("INVALID_REDIRECT_URL");
		}
	});

	it("should return OAUTH_CREDENTIALS_INVALID error when code is missing", async () => {
		const signedState = generateSignedState({ client: newClientType("web") }, mockEnv.OAUTH_STATE_HMAC_SECRET);
		const provider = newOAuthProvider("discord");

		const result = await oauthLoginCallbackUseCase.execute(
			undefined,
			"/dashboard",
			provider,
			signedState,
			undefined,
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_CREDENTIALS_INVALID");
		}
	});

	it("should return OAUTH_ACCESS_DENIED error when user denies access", async () => {
		const signedState = generateSignedState({ client: newClientType("web") }, mockEnv.OAUTH_STATE_HMAC_SECRET);
		const provider = newOAuthProvider("discord");

		const result = await oauthLoginCallbackUseCase.execute(
			"access_denied",
			"/dashboard",
			provider,
			signedState,
			undefined,
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_ACCESS_DENIED");
		}
	});

	it("should return OAUTH_PROVIDER_ERROR error for provider error", async () => {
		const signedState = generateSignedState({ client: newClientType("web") }, mockEnv.OAUTH_STATE_HMAC_SECRET);
		const provider = newOAuthProvider("discord");

		const result = await oauthLoginCallbackUseCase.execute(
			"server_error",
			"/dashboard",
			provider,
			signedState,
			undefined,
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_PROVIDER_ERROR");
		}
	});

	it("should return OAUTH_ACCOUNT_NOT_FOUND error when OAuth account does not exist", async () => {
		const signedState = generateSignedState({ client: newClientType("web") }, mockEnv.OAUTH_STATE_HMAC_SECRET);
		const provider = newOAuthProvider("discord");

		const result = await oauthLoginCallbackUseCase.execute(
			undefined,
			"/dashboard",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_ACCOUNT_NOT_FOUND");
		}
	});

	it("should process successful login when OAuth account exists", async () => {
		// existing user
		const user = createUser({
			id: newUserId(ulid()),
			name: "test",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: "https://example.com/icon.png",
			gender: newGender(DEFAULT_USER_GENDER),
		});

		// existing oauth account
		const oauthAccount = createOAuthAccount({
			userId: user.id,
			provider: newOAuthProvider("discord"),
			providerId: newOAuthProviderId("provider_user_id"),
		});

		userRepositoryMock.userMap.set(user.id, user);
		oauthAccountRepositoryMock.oauthAccountMap.set(
			createOAuthAccountKey(oauthAccount.provider, oauthAccount.providerId),
			oauthAccount,
		);

		const signedState = generateSignedState({ client: newClientType("web") }, mockEnv.OAUTH_STATE_HMAC_SECRET);
		const provider = newOAuthProvider("discord");

		const result = await oauthLoginCallbackUseCase.execute(
			undefined,
			"/dashboard",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(false);
		if (!isErr(result)) {
			expect(result.session.userId).toBe(user.id);
			expect(result.sessionToken).toBeDefined();
			expect(result.redirectURL).toBeInstanceOf(URL);
			expect(result.clientType).toBe(newClientType("web"));
			expect(sessionRepositoryMock.sessionMap.size).toBe(1);
		}
	});

	it("should return OAUTH_ACCOUNT_NOT_FOUND_BUT_LINKABLE error when user has same email but no OAuth account", async () => {
		// existing user with verified email
		const user = createUser({
			id: newUserId(ulid()),
			name: "test",
			email: "test@example.com",
			emailVerified: true,
			iconUrl: "https://example.com/icon.png",
			gender: newGender(DEFAULT_USER_GENDER),
		});

		userRepositoryMock.userMap.set(user.id, user);

		const signedState = generateSignedState({ client: newClientType("web") }, mockEnv.OAUTH_STATE_HMAC_SECRET);
		const provider = newOAuthProvider("discord");

		const result = await oauthLoginCallbackUseCase.execute(
			undefined,
			"/dashboard",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_ACCOUNT_NOT_FOUND_BUT_LINKABLE");
			if (result.code === "OAUTH_ACCOUNT_NOT_FOUND_BUT_LINKABLE") {
				expect(result.value.redirectURL).toBeInstanceOf(URL);
				expect(result.value.clientType).toBe(newClientType("web"));
				expect(result.value.accountAssociationSessionToken).toBeDefined();
				expect(result.value.accountAssociationSession).toBeDefined();
			}
		}
	});
});
