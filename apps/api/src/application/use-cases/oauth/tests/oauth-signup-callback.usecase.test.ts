import { beforeEach, describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import { DEFAULT_USER_GENDER } from "../../../../domain/entities";
import { newClientType, newGender, newOAuthProvider, newOAuthProviderId } from "../../../../domain/value-object";
import { createOAuthAccountFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	AccountAssociationSessionRepositoryMock,
	OAuthAccountRepositoryMock,
	OAuthProviderGatewayMock,
	OAuthStateSignerMock,
	SessionRepositoryMock,
	SessionSecretHasherMock,
	UserRepositoryMock,
	createAccountAssociationSessionsMap,
	createOAuthAccountKey,
	createOAuthAccountsMap,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import { OAuthSignupCallbackUseCase } from "../oauth-signup-callback.usecase";
import type { oauthStateSchema } from "../schema";

const userMap = createUsersMap();
const sessionMap = createSessionsMap();
const userPasswordHashMap = createUserPasswordHashMap();
const oauthAccountMap = createOAuthAccountsMap();
const accountAssociationSessionMap = createAccountAssociationSessionsMap();

const oauthProviderGateway = new OAuthProviderGatewayMock();
const sessionRepository = new SessionRepositoryMock({ sessionMap });
const oauthAccountRepository = new OAuthAccountRepositoryMock({ oauthAccountMap });
const userRepository = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
	sessionMap,
});
const accountAssociationSessionRepository = new AccountAssociationSessionRepositoryMock({
	accountAssociationSessionMap,
});
const sessionSecretHasher = new SessionSecretHasherMock();
const oauthStateSigner = new OAuthStateSignerMock<typeof oauthStateSchema>();

const oauthSignupCallbackUseCase = new OAuthSignupCallbackUseCase(
	oauthProviderGateway,
	sessionRepository,
	oauthAccountRepository,
	userRepository,
	accountAssociationSessionRepository,
	sessionSecretHasher,
	oauthStateSigner,
);

const PRODUCTION = false;

describe("OAuthSignupCallbackUseCase", () => {
	beforeEach(() => {
		userMap.clear();
		sessionMap.clear();
		userPasswordHashMap.clear();
		oauthAccountMap.clear();
		accountAssociationSessionMap.clear();
	});

	it("should return INVALID_OAUTH_STATE error for invalid state", async () => {
		const result = await oauthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			newOAuthProvider("discord"),
			"invalid_state",
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("INVALID_OAUTH_STATE");
		}
	});

	it("should return INVALID_REDIRECT_URL error for invalid redirect URI", async () => {
		const signedState = oauthStateSigner.generate({ client: newClientType("web") });

		const result = await oauthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"https://malicious.com/redirect",
			newOAuthProvider("discord"),
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
		const signedState = oauthStateSigner.generate({ client: newClientType("web") });

		const result = await oauthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			newOAuthProvider("discord"),
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
		const signedState = oauthStateSigner.generate({ client: newClientType("web") });

		const result = await oauthSignupCallbackUseCase.execute(
			PRODUCTION,
			"access_denied",
			"/dashboard",
			newOAuthProvider("discord"),
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
		const signedState = oauthStateSigner.generate({ client: newClientType("web") });

		const result = await oauthSignupCallbackUseCase.execute(
			PRODUCTION,
			"server_error",
			"/dashboard",
			newOAuthProvider("discord"),
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
		const signedState = oauthStateSigner.generate({ client: newClientType("web") });

		const result = await oauthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			newOAuthProvider("discord"),
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
			expect(sessionMap.size).toBe(1);
			expect(userMap.size).toBe(1);
			expect(oauthAccountMap.size).toBe(1);
			const savedSession = sessionMap.get(result.session.id);
			expect(savedSession).toBeDefined();
		}
	});

	it("should return OAUTH_ACCOUNT_ALREADY_REGISTERED error when user is already registered", async () => {
		const { user: existingUser } = createUserFixture({
			user: {
				email: "test@example.com",
				gender: newGender(DEFAULT_USER_GENDER),
			},
		});
		const { oauthAccount } = createOAuthAccountFixture({
			oauthAccount: {
				userId: existingUser.id,
				provider: newOAuthProvider("discord"),
				providerId: newOAuthProviderId("provider_user_id"),
			},
		});

		userMap.set(existingUser.id, existingUser);
		oauthAccountMap.set(createOAuthAccountKey(oauthAccount.provider, oauthAccount.providerId), oauthAccount);

		const signedState = oauthStateSigner.generate({ client: newClientType("web") });

		const result = await oauthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			newOAuthProvider("discord"),
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_ACCOUNT_ALREADY_REGISTERED");
		}
	});

	it("should return OAUTH_EMAIL_ALREADY_REGISTERED_BUT_LINKABLE error when user is already registered", async () => {
		const { user: existingUser } = createUserFixture({
			user: {
				email: "test@example.com",
				gender: newGender(DEFAULT_USER_GENDER),
			},
		});

		userMap.set(existingUser.id, existingUser);

		const signedState = oauthStateSigner.generate({ client: newClientType("web") });

		const result = await oauthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			newOAuthProvider("discord"),
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
				expect(accountAssociationSessionMap.size).toBe(1);
			}
		}
	});
});
