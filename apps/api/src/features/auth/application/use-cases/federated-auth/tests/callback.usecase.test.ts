import { assert, afterEach, beforeEach, describe, expect, it } from "vitest";
import { newClientPlatform, newGender } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { DEFAULT_USER_GENDER } from "../../../../domain/entities/user-registration";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../../../domain/value-objects/identity-providers";
import { createAuthUserFixture, createProviderAccountFixture } from "../../../../testing/fixtures";
import { IdentityProviderGatewayMock } from "../../../../testing/mocks/gateways";
import { HmacOAuthStateServiceMock } from "../../../../testing/mocks/infra";
import {
	AccountLinkSessionRepositoryMock,
	AuthUserRepositoryMock,
	ProviderAccountRepositoryMock,
	SessionRepositoryMock,
	createAccountLinkSessionsMap,
	createAuthUsersMap,
	createProviderAccountKey,
	createProviderAccountsMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import type { IdentityProviderUser } from "../../../ports/gateways/identity-provider.gateway.interface";
import { FederatedAuthCallbackUseCase } from "../callback.usecase";
import type { oauthStateSchema } from "../schema";

const authUserMap = createAuthUsersMap();
const sessionMap = createSessionsMap();
const providerAccountMap = createProviderAccountsMap();
const accountLinkSessionMap = createAccountLinkSessionsMap();

const sessionRepository = new SessionRepositoryMock({ sessionMap });
const providerAccountRepository = new ProviderAccountRepositoryMock({ providerAccountMap });
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const accountLinkSessionRepository = new AccountLinkSessionRepositoryMock({
	accountLinkSessionMap,
});

const tokenSecretService = new TokenSecretServiceMock();
const federatedAuthHmacOAuthStateService = new HmacOAuthStateServiceMock<typeof oauthStateSchema>();

const PRODUCTION = false;
const PROVIDER = newIdentityProviders("discord");

const { userRegistration } = createAuthUserFixture({
	userRegistration: {
		gender: newGender(DEFAULT_USER_GENDER),
	},
});

const identityProviderUser = {
	id: newIdentityProvidersUserId(ulid()),
	email: userRegistration.email,
	name: "Test User",
	iconURL: "https://example.com/icon.png",
	emailVerified: true,
} satisfies IdentityProviderUser;

const googleIdentityProviderGateway = new IdentityProviderGatewayMock({ identityProviderUser });
const discordIdentityProviderGateway = new IdentityProviderGatewayMock({ identityProviderUser });

const federatedAuthCallbackUseCase = new FederatedAuthCallbackUseCase(
	discordIdentityProviderGateway,
	googleIdentityProviderGateway,
	accountLinkSessionRepository,
	authUserRepository,
	providerAccountRepository,
	sessionRepository,
	federatedAuthHmacOAuthStateService,
	tokenSecretService,
);

describe("FederatedAuthCallbackUseCase", () => {
	beforeEach(() => {
		authUserMap.set(userRegistration.id, userRegistration);
	});
	afterEach(() => {
		authUserMap.clear();
		sessionMap.clear();
		providerAccountMap.clear();
		accountLinkSessionMap.clear();
	});

	it("Success: should process login flow when provider account exists", async () => {
		const { providerAccount } = createProviderAccountFixture({
			providerAccount: {
				userId: userRegistration.id,
				provider: PROVIDER,
				providerUserId: identityProviderUser.id,
			},
		});

		authUserMap.set(userRegistration.id, userRegistration);
		providerAccountMap.set(
			createProviderAccountKey(providerAccount.provider, providerAccount.providerUserId),
			providerAccount,
		);

		const signedState = federatedAuthHmacOAuthStateService.generate({ client: newClientPlatform("web") });

		const result = await federatedAuthCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			PROVIDER,
			signedState ?? "",
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { session, sessionToken, redirectURL, clientPlatform, flow } = result.value;

		// check flow
		expect(flow).toBe("login");

		// check session
		expect(session.userId).toBe(userRegistration.id);
		expect(session.secretHash).toStrictEqual(new TextEncoder().encode("__token-secret-hashed:token-secret"));

		// check session token
		// Mockの固定値を確認: TokenSecretServiceMockは `"token-secret"` を返す
		expect(sessionToken).toBe(`${session.id}.token-secret`);

		// check client platform
		expect(clientPlatform).toBe(newClientPlatform("web"));

		// check redirect URL
		expect(redirectURL).toBeInstanceOf(URL);
		expect(redirectURL.pathname).toBe("/dashboard");

		// check session is saved
		const savedSession = sessionMap.get(session.id);
		expect(savedSession).toStrictEqual(session);
	});

	it("Success: should process signup flow when no existing account or user found", async () => {
		// clear auth user map to simulate no existing account or user found
		authUserMap.clear();

		const signedState = federatedAuthHmacOAuthStateService.generate({ client: newClientPlatform("web") });

		const result = await federatedAuthCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			PROVIDER,
			signedState ?? "",
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { session, sessionToken, redirectURL, clientPlatform, flow } = result.value;

		// check session
		expect(session.userId).toBeDefined();
		expect(session.secretHash).toStrictEqual(new TextEncoder().encode("__token-secret-hashed:token-secret"));

		// check session token
		expect(sessionToken).toBe(`${session.id}.token-secret`);

		// check flow
		expect(flow).toBe("signup");

		// check client platform
		expect(clientPlatform).toBe(newClientPlatform("web"));

		// check redirect URL
		expect(redirectURL.pathname).toBe("/dashboard");

		// check user is created
		expect(authUserMap.size).toBe(1);
		const savedUser = Array.from(authUserMap.values())[0];
		assert(savedUser);
		expect(savedUser.id).toBe(session.userId);
		expect(savedUser.name).toBe("Test User");
		expect(savedUser.email).toBe(userRegistration.email);
		expect(savedUser.emailVerified).toBe(true);
		expect(savedUser.iconUrl).not.toBeNull();
		expect(savedUser.gender).toBe(newGender(DEFAULT_USER_GENDER));
		expect(savedUser.passwordHash).toBe(null);
		expect(savedUser.createdAt).toBeDefined();
		expect(savedUser.updatedAt).toBeDefined();

		// check provider account is created
		expect(providerAccountMap.size).toBe(1);
		const savedProviderAccount = Array.from(providerAccountMap.values())[0];
		assert(savedProviderAccount);
		expect(savedProviderAccount.userId).toBe(savedUser.id);
		expect(savedProviderAccount.provider).toBe(PROVIDER);
		expect(savedProviderAccount.providerUserId).toBe(identityProviderUser.id);
		expect(savedProviderAccount.linkedAt).toBeDefined();

		// check session is saved
		const savedSession = sessionMap.get(session.id);
		expect(savedSession).toStrictEqual(session);
	});

	it("Error: should return ACCOUNT_LINK_AVAILABLE error when user with same email exists but no provider account", async () => {
		const signedState = federatedAuthHmacOAuthStateService.generate({ client: newClientPlatform("web") });

		const result = await federatedAuthCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			PROVIDER,
			signedState ?? "",
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("ACCOUNT_LINK_AVAILABLE");
		assert(result.code === "ACCOUNT_LINK_AVAILABLE");

		const { redirectURL, clientPlatform, accountLinkSessionToken, accountLinkSession } = result.context;

		// check account link session token
		expect(accountLinkSessionToken).toBe(`${accountLinkSession.id}.token-secret`);

		// check redirect URL
		expect(redirectURL).toBeInstanceOf(URL);
		expect(redirectURL.pathname).toBe("/dashboard");

		// check client platform
		expect(clientPlatform).toBe(newClientPlatform("web"));

		// check account link session
		expect(accountLinkSession.userId).toBe(userRegistration.id);
		expect(accountLinkSession.email).toBe(userRegistration.email);
		expect(accountLinkSession.provider).toBe(PROVIDER);

		// check account link session is saved
		expect(accountLinkSessionMap.size).toBe(1);
		const savedAccountLinkSession = Array.from(accountLinkSessionMap.values())[0];
		assert(savedAccountLinkSession);
		expect(savedAccountLinkSession).toStrictEqual(accountLinkSession);
	});

	it("Error: should return INVALID_STATE error for invalid state format", async () => {
		const result = await federatedAuthCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			PROVIDER,
			"invalid_state",
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_STATE");
	});

	it("Error: should return INVALID_STATE error for empty state", async () => {
		const result = await federatedAuthCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			PROVIDER,
			"",
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_STATE");
	});

	it("Error: should return INVALID_REDIRECT_URI error for external malicious redirect URI", async () => {
		const signedState = federatedAuthHmacOAuthStateService.generate({ client: newClientPlatform("web") });

		const result = await federatedAuthCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"https://malicious.com/redirect",
			PROVIDER,
			signedState ?? "",
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_REDIRECT_URI");
	});

	it("Error: should return INVALID_REDIRECT_URI error for javascript: protocol", async () => {
		const signedState = federatedAuthHmacOAuthStateService.generate({ client: newClientPlatform("web") });

		const result = await federatedAuthCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"javascript:alert('xss')",
			PROVIDER,
			signedState ?? "",
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_REDIRECT_URI");
	});

	it("Error: should return PROVIDER_ACCESS_DENIED error when user denies access", async () => {
		const signedState = federatedAuthHmacOAuthStateService.generate({ client: newClientPlatform("web") });

		const result = await federatedAuthCallbackUseCase.execute(
			PRODUCTION,
			"access_denied",
			"/dashboard",
			PROVIDER,
			signedState ?? "",
			undefined,
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);

		expect(result.code).toBe("PROVIDER_ACCESS_DENIED");
		assert(result.code === "PROVIDER_ACCESS_DENIED");

		expect(result.context.redirectURL).toBeInstanceOf(URL);
		expect(result.context.redirectURL.pathname).toBe("/dashboard");
	});

	it("Error: should return PROVIDER_ERROR error for provider error", async () => {
		const signedState = federatedAuthHmacOAuthStateService.generate({ client: newClientPlatform("web") });

		const result = await federatedAuthCallbackUseCase.execute(
			PRODUCTION,
			"server_error",
			"/dashboard",
			PROVIDER,
			signedState ?? "",
			undefined,
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);

		expect(result.code).toBe("PROVIDER_ERROR");
		assert(result.code === "PROVIDER_ERROR");

		expect(result.context.redirectURL).toBeInstanceOf(URL);
		expect(result.context.redirectURL.pathname).toBe("/dashboard");
	});

	it("Error: should return TOKEN_EXCHANGE_FAILED error when code is missing", async () => {
		const signedState = federatedAuthHmacOAuthStateService.generate({ client: newClientPlatform("web") });

		const result = await federatedAuthCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			PROVIDER,
			signedState ?? "",
			undefined,
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("TOKEN_EXCHANGE_FAILED");
	});

	it("Error: should return TOKEN_EXCHANGE_FAILED error when code is empty string", async () => {
		const signedState = federatedAuthHmacOAuthStateService.generate({ client: newClientPlatform("web") });

		const result = await federatedAuthCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			PROVIDER,
			signedState ?? "",
			"",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("TOKEN_EXCHANGE_FAILED");
	});
});
