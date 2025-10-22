import { beforeEach, describe, expect, it } from "vitest";
import { newClientType, newGender } from "../../../../../../shared/domain/value-objects";
import { SessionSecretHasherMock } from "../../../../../../shared/testing/mocks/system";
import { DEFAULT_USER_GENDER } from "../../../../domain/entities/user-registration";
import {
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
} from "../../../../domain/value-objects/external-identity";
import { createAuthUserFixture, createExternalIdentityFixture } from "../../../../testing/fixtures";
import { OAuthProviderGatewayMock } from "../../../../testing/mocks/gateways";
import { HmacOAuthStateSignerMock } from "../../../../testing/mocks/infra";
import {
	AccountAssociationSessionRepositoryMock,
	AuthUserRepositoryMock,
	ExternalIdentityRepositoryMock,
	SessionRepositoryMock,
	createAccountAssociationSessionsMap,
	createAuthUsersMap,
	createExternalIdentitiesMap,
	createExternalIdentityKey,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { ExternalAuthSignupCallbackUseCase } from "../external-auth-signup-callback.usecase";
import type { oauthStateSchema } from "../schema";

const authUserMap = createAuthUsersMap();
const sessionMap = createSessionsMap();
const externalIdentityMap = createExternalIdentitiesMap();
const accountAssociationSessionMap = createAccountAssociationSessionsMap();

const oauthProviderGateway = new OAuthProviderGatewayMock();
const sessionRepository = new SessionRepositoryMock({ sessionMap });
const externalIdentityRepository = new ExternalIdentityRepositoryMock({ externalIdentityMap });
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const accountAssociationSessionRepository = new AccountAssociationSessionRepositoryMock({
	accountAssociationSessionMap,
});
const sessionSecretHasher = new SessionSecretHasherMock();
const externalAuthOAuthStateSigner = new HmacOAuthStateSignerMock<typeof oauthStateSchema>();

const externalAuthSignupCallbackUseCase = new ExternalAuthSignupCallbackUseCase(
	oauthProviderGateway,
	oauthProviderGateway,
	sessionRepository,
	externalIdentityRepository,
	authUserRepository,
	accountAssociationSessionRepository,
	sessionSecretHasher,
	externalAuthOAuthStateSigner,
);

const PRODUCTION = false;

const provider = newExternalIdentityProvider("discord");

describe("ExternalAuthSignupCallbackUseCase", () => {
	beforeEach(() => {
		authUserMap.clear();
		sessionMap.clear();
		externalIdentityMap.clear();
		accountAssociationSessionMap.clear();
	});

	it("should return INVALID_STATE error for invalid state", async () => {
		const result = await externalAuthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			provider,
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
		const signedState = externalAuthOAuthStateSigner.generate({ client: newClientType("web") });

		const result = await externalAuthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"https://malicious.com/redirect",
			provider,
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
		const signedState = externalAuthOAuthStateSigner.generate({ client: newClientType("web") });

		const result = await externalAuthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			provider,
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
		const signedState = externalAuthOAuthStateSigner.generate({ client: newClientType("web") });

		const result = await externalAuthSignupCallbackUseCase.execute(
			PRODUCTION,
			"access_denied",
			"/dashboard",
			provider,
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
		const signedState = externalAuthOAuthStateSigner.generate({ client: newClientType("web") });

		const result = await externalAuthSignupCallbackUseCase.execute(
			PRODUCTION,
			"server_error",
			"/dashboard",
			provider,
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
		const signedState = externalAuthOAuthStateSigner.generate({ client: newClientType("web") });

		const result = await externalAuthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			provider,
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
			expect(authUserMap.size).toBe(1);
			expect(externalIdentityMap.size).toBe(1);
			const savedSession = sessionMap.get(session.id);
			expect(savedSession).toBeDefined();
		}
	});

	it("should return ACCOUNT_ALREADY_REGISTERED error when user is already registered", async () => {
		const { userRegistration: existingUser } = createAuthUserFixture({
			userRegistration: {
				email: "test@example.com",
				gender: newGender(DEFAULT_USER_GENDER),
			},
		});
		const { externalIdentity: oauthAccount } = createExternalIdentityFixture({
			externalIdentity: {
				userId: existingUser.id,
				provider: provider,
				providerUserId: newExternalIdentityProviderUserId("provider_user_id"),
			},
		});

		authUserMap.set(existingUser.id, existingUser);
		externalIdentityMap.set(
			createExternalIdentityKey(oauthAccount.provider, oauthAccount.providerUserId),
			oauthAccount,
		);

		const signedState = externalAuthOAuthStateSigner.generate({ client: newClientType("web") });

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
		const { userRegistration: existingUser } = createAuthUserFixture({
			userRegistration: {
				email: "test@example.com",
				gender: newGender(DEFAULT_USER_GENDER),
			},
		});

		authUserMap.set(existingUser.id, existingUser);

		const signedState = externalAuthOAuthStateSigner.generate({ client: newClientType("web") });

		const result = await externalAuthSignupCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			provider,
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
