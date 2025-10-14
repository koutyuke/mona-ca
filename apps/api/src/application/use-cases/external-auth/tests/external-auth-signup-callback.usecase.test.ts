import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_USER_GENDER } from "../../../../domain/entities";
import {
	newClientType,
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
	newGender,
} from "../../../../domain/value-objects";
import { createExternalIdentityFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	AccountAssociationSessionRepositoryMock,
	ExternalIdentityRepositoryMock,
	OAuthProviderGatewayMock,
	OAuthStateSignerMock,
	SessionRepositoryMock,
	SessionSecretHasherMock,
	UserRepositoryMock,
	createAccountAssociationSessionsMap,
	createExternalIdentitiesMap,
	createExternalIdentityKey,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import { ExternalAuthSignupCallbackUseCase } from "../external-auth-signup-callback.usecase";
import type { oauthStateSchema } from "../schema";

const userMap = createUsersMap();
const sessionMap = createSessionsMap();
const userPasswordHashMap = createUserPasswordHashMap();
const externalIdentityMap = createExternalIdentitiesMap();
const accountAssociationSessionMap = createAccountAssociationSessionsMap();

const oauthProviderGateway = new OAuthProviderGatewayMock();
const sessionRepository = new SessionRepositoryMock({ sessionMap });
const externalIdentityRepository = new ExternalIdentityRepositoryMock({ externalIdentityMap });
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

const externalAuthSignupCallbackUseCase = new ExternalAuthSignupCallbackUseCase(
	oauthProviderGateway,
	sessionRepository,
	externalIdentityRepository,
	userRepository,
	accountAssociationSessionRepository,
	sessionSecretHasher,
	oauthStateSigner,
);

const PRODUCTION = false;

describe("ExternalAuthSignupCallbackUseCase", () => {
	beforeEach(() => {
		userMap.clear();
		sessionMap.clear();
		userPasswordHashMap.clear();
		externalIdentityMap.clear();
		accountAssociationSessionMap.clear();
	});

	it("should return INVALID_STATE error for invalid state", async () => {
		const result = await externalAuthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			newExternalIdentityProvider("discord"),
			"invalid_state",
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("INVALID_STATE");
		}
	});

	it("should return INVALID_REDIRECT_URI error for invalid redirect URI", async () => {
		const signedState = oauthStateSigner.generate({ client: newClientType("web") });

		const result = await externalAuthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"https://malicious.com/redirect",
			newExternalIdentityProvider("discord"),
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("INVALID_REDIRECT_URI");
		}
	});

	it("should return TOKEN_EXCHANGE_FAILED error when code is missing", async () => {
		const signedState = oauthStateSigner.generate({ client: newClientType("web") });

		const result = await externalAuthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			newExternalIdentityProvider("discord"),
			signedState,
			undefined,
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("TOKEN_EXCHANGE_FAILED");
		}
	});

	it("should return PROVIDER_ACCESS_DENIED error when user denies access", async () => {
		const signedState = oauthStateSigner.generate({ client: newClientType("web") });

		const result = await externalAuthSignupCallbackUseCase.execute(
			PRODUCTION,
			"access_denied",
			"/dashboard",
			newExternalIdentityProvider("discord"),
			signedState,
			undefined,
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("PROVIDER_ACCESS_DENIED");
		}
	});

	it("should return PROVIDER_ERROR error for provider error", async () => {
		const signedState = oauthStateSigner.generate({ client: newClientType("web") });

		const result = await externalAuthSignupCallbackUseCase.execute(
			PRODUCTION,
			"server_error",
			"/dashboard",
			newExternalIdentityProvider("discord"),
			signedState,
			undefined,
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("PROVIDER_ERROR");
		}
	});

	it("should process successful signup with new user", async () => {
		const signedState = oauthStateSigner.generate({ client: newClientType("web") });

		const result = await externalAuthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			newExternalIdentityProvider("discord"),
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(false);
		if (!result.isErr) {
			const { session, sessionToken, redirectURL, clientType } = result.value;
			expect(session.userId).toBeDefined();
			expect(sessionToken).toBeDefined();
			expect(redirectURL).toBeInstanceOf(URL);
			expect(clientType).toBe(newClientType("web"));
			expect(sessionMap.size).toBe(1);
			expect(userMap.size).toBe(1);
			expect(externalIdentityMap.size).toBe(1);
			const savedSession = sessionMap.get(session.id);
			expect(savedSession).toBeDefined();
		}
	});

	it("should return ACCOUNT_ALREADY_REGISTERED error when user is already registered", async () => {
		const { user: existingUser } = createUserFixture({
			user: {
				email: "test@example.com",
				gender: newGender(DEFAULT_USER_GENDER),
			},
		});
		const { externalIdentity: oauthAccount } = createExternalIdentityFixture({
			externalIdentity: {
				userId: existingUser.id,
				provider: newExternalIdentityProvider("discord"),
				providerUserId: newExternalIdentityProviderUserId("provider_user_id"),
			},
		});

		userMap.set(existingUser.id, existingUser);
		externalIdentityMap.set(
			createExternalIdentityKey(oauthAccount.provider, oauthAccount.providerUserId),
			oauthAccount,
		);

		const signedState = oauthStateSigner.generate({ client: newClientType("web") });

		const result = await externalAuthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			newExternalIdentityProvider("discord"),
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_ALREADY_REGISTERED");
		}
	});

	it("should return ACCOUNT_ASSOCIATION_AVAILABLE error when user is already registered", async () => {
		const { user: existingUser } = createUserFixture({
			user: {
				email: "test@example.com",
				gender: newGender(DEFAULT_USER_GENDER),
			},
		});

		userMap.set(existingUser.id, existingUser);

		const signedState = oauthStateSigner.generate({ client: newClientType("web") });

		const result = await externalAuthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			newExternalIdentityProvider("discord"),
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_ASSOCIATION_AVAILABLE");
			if (result.code === "ACCOUNT_ASSOCIATION_AVAILABLE") {
				const { redirectURL, clientType, accountAssociationSessionToken, accountAssociationSession } = result.context;
				expect(redirectURL).toBeInstanceOf(URL);
				expect(clientType).toBe(newClientType("web"));
				expect(accountAssociationSessionToken).toBeDefined();
				expect(accountAssociationSession).toBeDefined();
				expect(accountAssociationSessionMap.size).toBe(1);
			}
		}
	});
});
