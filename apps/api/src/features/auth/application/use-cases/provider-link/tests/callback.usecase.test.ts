import { assert, afterEach, describe, expect, it } from "vitest";
import { newClientPlatform } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../../../domain/value-objects/identity-providers";
import { createAuthUserFixture, createProviderAccountFixture } from "../../../../testing/fixtures";
import { IdentityProviderGatewayMock } from "../../../../testing/mocks/gateways";
import { HmacSignedStateServiceMock } from "../../../../testing/mocks/infra";
import {
	ProviderAccountRepositoryMock,
	createProviderAccountKey,
	createProviderAccountsMap,
} from "../../../../testing/mocks/repositories";
import type { UserInfo } from "../../../ports/out/gateways/identity-provider.gateway.interface";
import { ProviderLinkCallbackUseCase } from "../callback.usecase";
import type { providerLinkStateSchema } from "../schema";

const providerAccountMap = createProviderAccountsMap();

const providerAccountRepository = new ProviderAccountRepositoryMock({ providerAccountMap });
const providerLinkSignedStateService = new HmacSignedStateServiceMock<typeof providerLinkStateSchema>();

const PRODUCTION = false;
const PROVIDER = newIdentityProviders("discord");
const { userCredentials, userRegistration } = createAuthUserFixture();

const userInfo = {
	id: newIdentityProvidersUserId(ulid()),
	email: userRegistration.email,
	name: "Test User",
	iconURL: "https://example.com/icon.png",
	emailVerified: true,
} satisfies UserInfo;

const googleIdentityProviderGateway = new IdentityProviderGatewayMock({ userInfo });
const discordIdentityProviderGateway = new IdentityProviderGatewayMock({ userInfo });

const providerLinkCallbackUseCase = new ProviderLinkCallbackUseCase(
	discordIdentityProviderGateway,
	googleIdentityProviderGateway,
	providerAccountRepository,
	providerLinkSignedStateService,
);

describe("ProviderLinkCallbackUseCase", () => {
	afterEach(() => {
		providerAccountMap.clear();
	});

	it("Success: should link provider account when no conflicts exist", async () => {
		const signedState = providerLinkSignedStateService.sign({
			client: newClientPlatform("web"),
			uid: userCredentials.id,
		});

		const result = await providerLinkCallbackUseCase.execute(
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

		const { redirectURL, clientPlatform } = result.value;

		expect(redirectURL).toBeInstanceOf(URL);
		expect(redirectURL.pathname).toBe("/dashboard");
		expect(clientPlatform).toBe(newClientPlatform("web"));

		// check provider account is saved
		expect(providerAccountMap.size).toBe(1);
		const savedProviderAccount = Array.from(providerAccountMap.values())[0];
		assert(savedProviderAccount);
		expect(savedProviderAccount.userId).toBe(userCredentials.id);
		expect(savedProviderAccount.provider).toBe(PROVIDER);
		expect(savedProviderAccount.linkedAt).toBeDefined();
	});

	it("Error: should return INVALID_STATE error for invalid state format", async () => {
		const result = await providerLinkCallbackUseCase.execute(
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
		const result = await providerLinkCallbackUseCase.execute(
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
		const signedState = providerLinkSignedStateService.sign({
			client: newClientPlatform("web"),
			uid: userCredentials.id,
		});

		const result = await providerLinkCallbackUseCase.execute(
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
		const signedState = providerLinkSignedStateService.sign({
			client: newClientPlatform("web"),
			uid: userCredentials.id,
		});

		const result = await providerLinkCallbackUseCase.execute(
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
		const signedState = providerLinkSignedStateService.sign({
			client: newClientPlatform("web"),
			uid: userCredentials.id,
		});

		const result = await providerLinkCallbackUseCase.execute(
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
		const signedState = providerLinkSignedStateService.sign({
			client: newClientPlatform("web"),
			uid: userCredentials.id,
		});

		const result = await providerLinkCallbackUseCase.execute(
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
		const signedState = providerLinkSignedStateService.sign({
			client: newClientPlatform("web"),
			uid: userCredentials.id,
		});

		const result = await providerLinkCallbackUseCase.execute(
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
		const signedState = providerLinkSignedStateService.sign({
			client: newClientPlatform("web"),
			uid: userCredentials.id,
		});

		const result = await providerLinkCallbackUseCase.execute(
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

	it("Error: should return PROVIDER_ALREADY_LINKED error when user already has linked account for this provider", async () => {
		const providerUserId = newIdentityProvidersUserId("different_provider_id");

		const { providerAccount: existingProviderAccount } = createProviderAccountFixture({
			providerAccount: {
				userId: userCredentials.id,
				provider: PROVIDER,
				providerUserId,
			},
		});
		providerAccountMap.set(
			createProviderAccountKey(existingProviderAccount.provider, existingProviderAccount.providerUserId),
			existingProviderAccount,
		);

		const signedState = providerLinkSignedStateService.sign({
			client: newClientPlatform("web"),
			uid: userCredentials.id,
		});

		const result = await providerLinkCallbackUseCase.execute(
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
		expect(result.code).toBe("PROVIDER_ALREADY_LINKED");
		assert(result.code === "PROVIDER_ALREADY_LINKED");
		expect(result.context.redirectURL).toBeInstanceOf(URL);
		expect(result.context.redirectURL.pathname).toBe("/dashboard");
	});

	it("Error: should return ACCOUNT_LINKED_ELSEWHERE error when provider account is already linked to another user", async () => {
		const { userRegistration: anotherUser } = createAuthUserFixture();

		const { providerAccount: existingProviderAccount } = createProviderAccountFixture({
			providerAccount: {
				userId: anotherUser.id,
				provider: PROVIDER,
				providerUserId: userInfo.id,
			},
		});
		providerAccountMap.set(
			createProviderAccountKey(existingProviderAccount.provider, existingProviderAccount.providerUserId),
			existingProviderAccount,
		);

		const signedState = providerLinkSignedStateService.sign({
			client: newClientPlatform("web"),
			uid: userCredentials.id,
		});

		const result = await providerLinkCallbackUseCase.execute(
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
		expect(result.code).toBe("ACCOUNT_LINKED_ELSEWHERE");
		assert(result.code === "ACCOUNT_LINKED_ELSEWHERE");
		expect(result.context.redirectURL).toBeInstanceOf(URL);
		expect(result.context.redirectURL.pathname).toBe("/dashboard");
	});
});
