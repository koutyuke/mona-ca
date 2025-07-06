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
import type { IOAuthSignupCallbackUseCase } from "../interfaces/oauth-signup-callback.usecase.interface";
import { OAuthSignupCallbackUseCase } from "../oauth-signup-callback.usecase";

describe("OAuthSignupCallbackUseCase", () => {
	const mockEnv = {
		APP_ENV: "development" as const,
		OAUTH_STATE_HMAC_SECRET: "test_secret",
	};

	let oauthSignupCallbackUseCase: IOAuthSignupCallbackUseCase;
	let userRepositoryMock: UserRepositoryMock;
	let sessionRepositoryMock: SessionRepositoryMock;
	let oauthAccountRepositoryMock: OAuthAccountRepositoryMock;
	let sessionSecretServiceMock: SessionSecretServiceMock;
	let accountAssociationSessionSecretServiceMock: SessionSecretServiceMock;
	let oauthProviderGatewayMock: OAuthProviderGatewayMock;

	beforeEach(() => {
		const userMap = createUsersMap();
		const sessionMap = createSessionsMap();
		const userPasswordHashMap = createUserPasswordHashMap();
		const oauthAccountMap = createOAuthAccountsMap();
		const accountAssociationSessionMap = createAccountAssociationSessionsMap();

		sessionSecretServiceMock = new SessionSecretServiceMock();
		accountAssociationSessionSecretServiceMock = new SessionSecretServiceMock();
		oauthProviderGatewayMock = new OAuthProviderGatewayMock();
		sessionRepositoryMock = new SessionRepositoryMock({ sessionMap });
		oauthAccountRepositoryMock = new OAuthAccountRepositoryMock({ oauthAccountMap });
		userRepositoryMock = new UserRepositoryMock({
			userMap,
			userPasswordHashMap,
			sessionMap,
		});
		const accountAssociationSessionRepositoryMock = new AccountAssociationSessionRepositoryMock({
			accountAssociationSessionMap,
		});

		oauthSignupCallbackUseCase = new OAuthSignupCallbackUseCase(
			mockEnv,
			sessionSecretServiceMock,
			accountAssociationSessionSecretServiceMock,
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

		const result = await oauthSignupCallbackUseCase.execute(
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

		const result = await oauthSignupCallbackUseCase.execute(
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

		const result = await oauthSignupCallbackUseCase.execute(
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

		const result = await oauthSignupCallbackUseCase.execute(
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

		const result = await oauthSignupCallbackUseCase.execute(
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

	it("should process successful signup with new user", async () => {
		const signedState = generateSignedState({ client: newClientType("web") }, mockEnv.OAUTH_STATE_HMAC_SECRET);
		const provider = newOAuthProvider("discord");

		const result = await oauthSignupCallbackUseCase.execute(
			undefined,
			"/dashboard",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(false);
		if (!isErr(result)) {
			expect(result.session.userId).toBeDefined();
			expect(result.sessionToken).toBeDefined();
			expect(result.redirectURL).toBeInstanceOf(URL);
			expect(result.clientType).toBe(newClientType("web"));
			expect(sessionRepositoryMock.sessionMap.size).toBe(1);
			expect(userRepositoryMock.userMap.size).toBe(1);
			expect(oauthAccountRepositoryMock.oauthAccountMap.size).toBe(1);
		}
	});

	it("should return OAUTH_ACCOUNT_ALREADY_REGISTERED error when user is already registered", async () => {
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

		const result = await oauthSignupCallbackUseCase.execute(
			undefined,
			"/dashboard",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_ACCOUNT_ALREADY_REGISTERED");
		}
	});

	it("should return OAUTH_EMAIL_ALREADY_REGISTERED_BUT_LINKABLE error when user is already registered but email is not verified", async () => {
		// existing user
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

		const result = await oauthSignupCallbackUseCase.execute(
			undefined,
			"/dashboard",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_EMAIL_ALREADY_REGISTERED_BUT_LINKABLE");
			if (result.code === "OAUTH_EMAIL_ALREADY_REGISTERED_BUT_LINKABLE") {
				expect(result.value.redirectURL).toBeInstanceOf(URL);
				expect(result.value.clientType).toBe(newClientType("web"));
				expect(result.value.accountAssociationSessionToken).toBeDefined();
				expect(result.value.accountAssociationSession).toBeDefined();
			}
		}
	});
});
