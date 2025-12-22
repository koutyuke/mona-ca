import { assert, afterEach, beforeEach, describe, expect, it } from "vitest";
import { newClientPlatform, newGender } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { DEFAULT_USER_GENDER } from "../../../../domain/entities/user-registration";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../../../domain/value-objects/identity-providers";
import { createAuthUserFixture, createProviderAccountFixture } from "../../../../testing/fixtures";
import { IdentityProviderGatewayMock } from "../../../../testing/mocks/gateways";
import { HmacSignedStateServiceMock } from "../../../../testing/mocks/infra";
import {
	AccountLinkRequestRepositoryMock,
	AuthUserRepositoryMock,
	ProviderAccountRepositoryMock,
	SessionRepositoryMock,
	createAccountLinkRequestMap,
	createAuthUserMap,
	createProviderAccountKey,
	createProviderAccountMap,
	createSessionMap,
} from "../../../../testing/mocks/repositories";
import type { UserInfo } from "../../../ports/out/gateways/identity-provider.gateway.interface";
import { FederatedAuthCallbackUseCase } from "../callback.usecase";
import type { federatedAuthStateSchema } from "../schema";

const authUserMap = createAuthUserMap();
const sessionMap = createSessionMap();
const providerAccountMap = createProviderAccountMap();
const accountLinkRequestMap = createAccountLinkRequestMap();

const sessionRepository = new SessionRepositoryMock({ sessionMap });
const providerAccountRepository = new ProviderAccountRepositoryMock({ providerAccountMap });
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const accountLinkRequestRepository = new AccountLinkRequestRepositoryMock({
	accountLinkRequestMap,
});

const tokenSecretService = new TokenSecretServiceMock();
const federatedAuthSignedStateService = new HmacSignedStateServiceMock<typeof federatedAuthStateSchema>();

const PRODUCTION = false;
const PROVIDER = newIdentityProviders("discord");

const { userRegistration } = createAuthUserFixture({
	userRegistration: {
		gender: newGender(DEFAULT_USER_GENDER),
	},
});

const userInfo = {
	id: newIdentityProvidersUserId(ulid()),
	email: userRegistration.email,
	name: "Test User",
	iconURL: "https://example.com/icon.png",
	emailVerified: true,
} satisfies UserInfo;

const googleIdentityProviderGateway = new IdentityProviderGatewayMock({ userInfo });
const discordIdentityProviderGateway = new IdentityProviderGatewayMock({ userInfo });

const federatedAuthCallbackUseCase = new FederatedAuthCallbackUseCase(
	discordIdentityProviderGateway,
	googleIdentityProviderGateway,
	accountLinkRequestRepository,
	authUserRepository,
	providerAccountRepository,
	sessionRepository,
	federatedAuthSignedStateService,
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
		accountLinkRequestMap.clear();
	});

	it("Success: should process login flow when provider account exists", async () => {
		const { providerAccount } = createProviderAccountFixture({
			providerAccount: {
				userId: userRegistration.id,
				provider: PROVIDER,
				providerUserId: userInfo.id,
			},
		});

		authUserMap.set(userRegistration.id, userRegistration);
		providerAccountMap.set(
			createProviderAccountKey(providerAccount.provider, providerAccount.providerUserId),
			providerAccount,
		);

		const signedState = federatedAuthSignedStateService.sign({ client: newClientPlatform("web") });

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

		const signedState = federatedAuthSignedStateService.sign({ client: newClientPlatform("web") });

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
		expect(savedProviderAccount.providerUserId).toBe(userInfo.id);
		expect(savedProviderAccount.linkedAt).toBeDefined();

		// check session is saved
		const savedSession = sessionMap.get(session.id);
		expect(savedSession).toStrictEqual(session);
	});

	it("Error: should return PROVIDER_LINK_PROPOSAL error when user with same email exists but no provider account", async () => {
		const signedState = federatedAuthSignedStateService.sign({ client: newClientPlatform("web") });

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
		expect(result.code).toBe("ACCOUNT_LINK_REQUEST");
		assert(result.code === "ACCOUNT_LINK_REQUEST");

		const { redirectURL, clientPlatform, accountLinkRequestToken, accountLinkRequest } = result.context;

		// check provider link proposal token
		expect(accountLinkRequestToken).toBe(`${accountLinkRequest.id}.token-secret`);

		// check redirect URL
		expect(redirectURL).toBeInstanceOf(URL);
		expect(redirectURL.pathname).toBe("/dashboard");

		// check client platform
		expect(clientPlatform).toBe(newClientPlatform("web"));

		// check provider link proposal
		expect(accountLinkRequest.userId).toBe(userRegistration.id);
		expect(accountLinkRequest.email).toBe(userRegistration.email);
		expect(accountLinkRequest.provider).toBe(PROVIDER);

		// check provider link proposal is saved
		expect(accountLinkRequestMap.size).toBe(1);
		const savedAccountLinkRequest = Array.from(accountLinkRequestMap.values())[0];
		assert(savedAccountLinkRequest);
		expect(savedAccountLinkRequest).toStrictEqual(accountLinkRequest);
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
		const signedState = federatedAuthSignedStateService.sign({ client: newClientPlatform("web") });

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
		const signedState = federatedAuthSignedStateService.sign({ client: newClientPlatform("web") });

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
		const signedState = federatedAuthSignedStateService.sign({ client: newClientPlatform("web") });

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
		const signedState = federatedAuthSignedStateService.sign({ client: newClientPlatform("web") });

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
		const signedState = federatedAuthSignedStateService.sign({ client: newClientPlatform("web") });

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
		const signedState = federatedAuthSignedStateService.sign({ client: newClientPlatform("web") });

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
