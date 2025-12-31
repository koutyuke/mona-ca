import { assert, describe, expect, it } from "vitest";
import { newClientPlatform } from "../../../../../../core/domain/value-objects";
import { newIdentityProviders } from "../../../../domain/value-objects/identity-providers";
import { IdentityProviderGatewayMock } from "../../../../testing/mocks/gateways";
import { HmacSignedStateServiceMock } from "../../../../testing/mocks/infra";
import { FederatedAuthRequestUseCase } from "../request.usecase";

import type { federatedAuthStateSchema } from "../schema";

const googleIdentityProviderGateway = new IdentityProviderGatewayMock();
const discordIdentityProviderGateway = new IdentityProviderGatewayMock();
const federatedAuthSignedStateService = new HmacSignedStateServiceMock<typeof federatedAuthStateSchema>();

const federatedAuthRequestUseCase = new FederatedAuthRequestUseCase(
	discordIdentityProviderGateway,
	googleIdentityProviderGateway,
	federatedAuthSignedStateService,
);

const PRODUCTION = true;

describe("FederatedAuthRequestUseCase", () => {
	it("Success: should generate federated auth request with valid redirect URI for web client", () => {
		const provider = newIdentityProviders("google");
		const result = federatedAuthRequestUseCase.execute(PRODUCTION, newClientPlatform("web"), provider, "/dashboard");

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = result.value;

		// check state
		expect(state).toBe(`${federatedAuthSignedStateService.signPrefix}:${JSON.stringify({ client: "web" })}`);

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
		const result = federatedAuthRequestUseCase.execute(PRODUCTION, newClientPlatform("mobile"), provider, "/home");

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = result.value;

		// check state
		expect(state).toBe(`${federatedAuthSignedStateService.signPrefix}:${JSON.stringify({ client: "mobile" })}`);

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
		const result = federatedAuthRequestUseCase.execute(PRODUCTION, newClientPlatform("web"), provider, "");

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { redirectToClientURL } = result.value;
		expect(redirectToClientURL.pathname).toBe("/");
	});

	it("Success: should generate different code verifiers for each request", () => {
		const provider = newIdentityProviders("google");
		const result1 = federatedAuthRequestUseCase.execute(PRODUCTION, newClientPlatform("web"), provider, "/dashboard");
		const result2 = federatedAuthRequestUseCase.execute(PRODUCTION, newClientPlatform("web"), provider, "/dashboard");

		assert(result1.isOk);
		assert(result2.isOk);

		// check different code verifiers are generated for each request for security
		expect(result1.value.codeVerifier).not.toBe(result2.value.codeVerifier);
	});

	it("Success: should support different providers (google and discord)", () => {
		const googleProvider = newIdentityProviders("google");
		const discordProvider = newIdentityProviders("discord");

		const googleResult = federatedAuthRequestUseCase.execute(
			PRODUCTION,
			newClientPlatform("web"),
			googleProvider,
			"/dashboard",
		);
		const discordResult = federatedAuthRequestUseCase.execute(
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
		const result = federatedAuthRequestUseCase.execute(
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
		const result = federatedAuthRequestUseCase.execute(
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
