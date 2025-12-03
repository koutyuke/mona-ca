import { assert, describe, expect, it } from "vitest";
import { newClientPlatform } from "../../../../../../core/domain/value-objects";
import { newIdentityProviders } from "../../../../domain/value-objects/identity-providers";
import { createAuthUserFixture } from "../../../../testing/fixtures";
import { IdentityProviderGatewayMock } from "../../../../testing/mocks/gateways";
import { HmacOAuthStateServiceMock } from "../../../../testing/mocks/infra";
import { ProviderConnectionRequestUseCase } from "../request.usecase";
import type { providerConnectionStateSchema } from "../schema";

const googleIdentityProviderGateway = new IdentityProviderGatewayMock();
const discordIdentityProviderGateway = new IdentityProviderGatewayMock();
const providerConnectionOAuthStateService = new HmacOAuthStateServiceMock<typeof providerConnectionStateSchema>();

const providerConnectionRequestUseCase = new ProviderConnectionRequestUseCase(
	googleIdentityProviderGateway,
	discordIdentityProviderGateway,
	providerConnectionOAuthStateService,
);

const PRODUCTION = false;
const { userCredentials } = createAuthUserFixture();

describe("ProviderConnectionRequestUseCase", () => {
	it("Success: should generate provider connection request with valid redirect URI for web client", async () => {
		const provider = newIdentityProviders("google");
		const result = await providerConnectionRequestUseCase.execute(
			PRODUCTION,
			newClientPlatform("web"),
			provider,
			"/settings/connections",
			userCredentials,
		);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = result.value;

		// check state
		// Mockの固定値を確認: HmacOAuthStateServiceMockは `__hmac-oauth-state-signed:${JSON.stringify(payload)}` を返す
		expect(state).toBe(`__hmac-oauth-state-signed:{"client":"web","uid":"${userCredentials.id}"}`);

		// check code verifier
		expect(codeVerifier).toBeDefined();
		expect(codeVerifier.length).toBeGreaterThan(0);

		// check redirect to client URL
		expect(redirectToClientURL).toBeInstanceOf(URL);
		expect(redirectToClientURL.pathname).toBe("/settings/connections");

		// check redirect to provider URL
		expect(redirectToProviderURL).toBeInstanceOf(URL);
		expect(redirectToProviderURL.href).toContain("provider.example.com");
		expect(redirectToProviderURL.searchParams.get("state")).toBe(state);
		expect(redirectToProviderURL.searchParams.get("code_verifier")).toBe(codeVerifier);
	});

	it("Success: should generate provider connection request with valid redirect URI for mobile client", async () => {
		const provider = newIdentityProviders("google");
		const result = await providerConnectionRequestUseCase.execute(
			PRODUCTION,
			newClientPlatform("mobile"),
			provider,
			"/settings/connections",
			userCredentials,
		);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = result.value;

		expect(state).toBe(`__hmac-oauth-state-signed:{"client":"mobile","uid":"${userCredentials.id}"}`);
		expect(codeVerifier).toBeDefined();
		expect(codeVerifier.length).toBeGreaterThan(0);
		expect(redirectToClientURL).toBeInstanceOf(URL);
		expect(redirectToClientURL.pathname).toBe("/settings/connections");
		expect(redirectToProviderURL).toBeInstanceOf(URL);
		expect(redirectToProviderURL.searchParams.get("state")).toBe(state);
		expect(redirectToProviderURL.searchParams.get("code_verifier")).toBe(codeVerifier);
	});

	it("Success: should use default path when redirect URI is empty", async () => {
		const provider = newIdentityProviders("google");
		const result = await providerConnectionRequestUseCase.execute(
			PRODUCTION,
			newClientPlatform("web"),
			provider,
			"",
			userCredentials,
		);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { redirectToClientURL } = result.value;
		expect(redirectToClientURL.pathname).toBe("/");
	});

	it("Success: should include userId in the generated state", async () => {
		const provider = newIdentityProviders("google");
		const result = await providerConnectionRequestUseCase.execute(
			PRODUCTION,
			newClientPlatform("web"),
			provider,
			"/settings/connections",
			userCredentials,
		);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { state } = result.value;
		const validatedState = providerConnectionOAuthStateService.validate(state);
		expect(validatedState.isErr).toBe(false);
		assert(validatedState.isOk);

		// セキュリティ: stateにuserIdが含まれていること（CSRF攻撃の防止）
		expect(validatedState.value.uid).toBe(userCredentials.id);
		expect(validatedState.value.client).toBe(newClientPlatform("web"));
	});

	it("Success: should generate different code verifiers for each request", async () => {
		const provider = newIdentityProviders("google");
		const result1 = await providerConnectionRequestUseCase.execute(
			PRODUCTION,
			newClientPlatform("web"),
			provider,
			"/settings/connections",
			userCredentials,
		);
		const result2 = await providerConnectionRequestUseCase.execute(
			PRODUCTION,
			newClientPlatform("web"),
			provider,
			"/settings/connections",
			userCredentials,
		);

		assert(result1.isOk);
		assert(result2.isOk);

		// セキュリティ: 各リクエストで異なるcode verifierが生成されること
		expect(result1.value.codeVerifier).not.toBe(result2.value.codeVerifier);
	});

	it("Error: should return INVALID_REDIRECT_URI error for external malicious redirect URI", async () => {
		const provider = newIdentityProviders("google");
		const result = await providerConnectionRequestUseCase.execute(
			PRODUCTION,
			newClientPlatform("web"),
			provider,
			"https://malicious.com/redirect",
			userCredentials,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_REDIRECT_URI");
	});

	it("Error: should return INVALID_REDIRECT_URI error for javascript: protocol", async () => {
		const provider = newIdentityProviders("google");
		const result = await providerConnectionRequestUseCase.execute(
			PRODUCTION,
			newClientPlatform("web"),
			provider,
			"javascript:alert('xss')",
			userCredentials,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_REDIRECT_URI");
	});
});
