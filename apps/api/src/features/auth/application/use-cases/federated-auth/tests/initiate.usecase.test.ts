import { assert, describe, expect, it } from "vitest";
import { newClientPlatform } from "../../../../../../core/domain/value-objects";
import { newIdentityProviders } from "../../../../domain/value-objects/identity-providers";
import { IdentityProviderGatewayMock } from "../../../../testing/mocks/gateways";
import { HmacOAuthStateServiceMock } from "../../../../testing/mocks/infra";
import { FederatedAuthInitiateUseCase } from "../initiate.usecase";
import type { oauthStateSchema } from "../schema";

const googleIdentityProviderGateway = new IdentityProviderGatewayMock();
const discordIdentityProviderGateway = new IdentityProviderGatewayMock();
const federatedAuthHmacOAuthStateService = new HmacOAuthStateServiceMock<typeof oauthStateSchema>();

const federatedAuthInitiateUseCase = new FederatedAuthInitiateUseCase(
	googleIdentityProviderGateway,
	discordIdentityProviderGateway,
	federatedAuthHmacOAuthStateService,
);

const PRODUCTION = true;

describe("FederatedAuthInitiateUseCase", () => {
	it("Success: should generate federated auth request with valid redirect URI for web client", () => {
		const provider = newIdentityProviders("google");
		const result = federatedAuthInitiateUseCase.execute(PRODUCTION, newClientPlatform("web"), provider, "/dashboard");

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = result.value;

		// check state
		expect(state).toBe('__hmac-oauth-state-signed:{"client":"web"}');

		// check code verifier
		expect(codeVerifier).toBeDefined();
		expect(codeVerifier.length).toBeGreaterThan(0);

		// check redirect to client URL
		expect(redirectToClientURL).toBeInstanceOf(URL);
		expect(redirectToClientURL.pathname).toBe("/dashboard");
		expect(redirectToClientURL.href).toContain("https://mona-ca.com/dashboard");

		// check redirect to provider URL
		expect(redirectToProviderURL).toBeInstanceOf(URL);
		expect(redirectToProviderURL.href).toContain("provider.example.com");

		// check state
		expect(redirectToProviderURL.searchParams.get("state")).toBe(state);
		expect(redirectToProviderURL.searchParams.get("code_verifier")).toBe(codeVerifier);
	});

	it("Success: should generate federated auth request with valid redirect URI for mobile client", () => {
		const provider = newIdentityProviders("google");
		const result = federatedAuthInitiateUseCase.execute(PRODUCTION, newClientPlatform("mobile"), provider, "/home");

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = result.value;

		// check state
		expect(state).toBe('__hmac-oauth-state-signed:{"client":"mobile"}');

		// check code verifier
		expect(codeVerifier).toBeDefined();
		expect(codeVerifier.length).toBeGreaterThan(0);

		// check redirect to client URL
		expect(redirectToClientURL).toBeInstanceOf(URL);
		expect(redirectToClientURL.pathname).toBe("/home");
		expect(redirectToClientURL.href).toContain("mona-ca:///home");

		// check redirect to provider URL
		expect(redirectToProviderURL).toBeInstanceOf(URL);
		expect(redirectToProviderURL.href).toContain("provider.example.com");

		// check state
		expect(redirectToProviderURL.searchParams.get("state")).toBe(state);
		expect(redirectToProviderURL.searchParams.get("code_verifier")).toBe(codeVerifier);
	});

	it("Success: should use default path when redirect URI is empty", () => {
		const provider = newIdentityProviders("google");
		const result = federatedAuthInitiateUseCase.execute(PRODUCTION, newClientPlatform("web"), provider, "");

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { redirectToClientURL } = result.value;
		expect(redirectToClientURL.pathname).toBe("/");
	});

	it("Success: should generate different code verifiers for each request", () => {
		const provider = newIdentityProviders("google");
		const result1 = federatedAuthInitiateUseCase.execute(PRODUCTION, newClientPlatform("web"), provider, "/dashboard");
		const result2 = federatedAuthInitiateUseCase.execute(PRODUCTION, newClientPlatform("web"), provider, "/dashboard");

		assert(result1.isOk);
		assert(result2.isOk);

		// セキュリティ: 各リクエストで異なるcode verifierが生成されること
		expect(result1.value.codeVerifier).not.toBe(result2.value.codeVerifier);
	});

	it("Success: should support different providers (google and discord)", () => {
		const googleProvider = newIdentityProviders("google");
		const discordProvider = newIdentityProviders("discord");

		const googleResult = federatedAuthInitiateUseCase.execute(
			PRODUCTION,
			newClientPlatform("web"),
			googleProvider,
			"/dashboard",
		);
		const discordResult = federatedAuthInitiateUseCase.execute(
			PRODUCTION,
			newClientPlatform("web"),
			discordProvider,
			"/dashboard",
		);

		assert(googleResult.isOk);
		assert(discordResult.isOk);

		expect(googleResult.value.redirectToProviderURL).toBeInstanceOf(URL);
		expect(discordResult.value.redirectToProviderURL).toBeInstanceOf(URL);
	});

	it("Error: should return INVALID_REDIRECT_URI error for external malicious redirect URI", () => {
		const provider = newIdentityProviders("google");
		const result = federatedAuthInitiateUseCase.execute(
			PRODUCTION,
			newClientPlatform("web"),
			provider,
			"https://malicious.com/redirect",
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_REDIRECT_URI");
	});

	it("Error: should return INVALID_REDIRECT_URI error for javascript: protocol", () => {
		const provider = newIdentityProviders("google");
		const result = federatedAuthInitiateUseCase.execute(
			PRODUCTION,
			newClientPlatform("web"),
			provider,
			"javascript:alert('xss')",
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_REDIRECT_URI");
	});
});
