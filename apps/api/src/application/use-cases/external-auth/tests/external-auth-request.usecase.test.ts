import { describe, expect, it } from "vitest";
import { newClientType } from "../../../../domain/value-objects";
import { OAuthProviderGatewayMock, OAuthStateSignerMock } from "../../../../tests/mocks";
import { ExternalAuthRequestUseCase } from "../external-auth-request.usecase";
import type { oauthStateSchema } from "../schema";

const oauthProviderGateway = new OAuthProviderGatewayMock();
const oauthStateSigner = new OAuthStateSignerMock<typeof oauthStateSchema>();

const externalAuthRequestUseCase = new ExternalAuthRequestUseCase(oauthProviderGateway, oauthStateSigner);

const PRODUCTION = false;

describe("ExternalAuthRequestUseCase", () => {
	it("should generate ExternalAuth request successfully for web client", () => {
		const result = externalAuthRequestUseCase.execute(PRODUCTION, newClientType("web"), "/dashboard");

		expect(result.isErr).toBe(false);
		if (!result.isErr) {
			const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = result.value;
			expect(state).toBeDefined();
			expect(codeVerifier).toBeDefined();
			expect(redirectToClientURL).toBeInstanceOf(URL);
			expect(redirectToProviderURL).toBeInstanceOf(URL);
			expect(redirectToClientURL.pathname).toBe("/dashboard");
		}
	});

	it("should generate ExternalAuth request successfully for mobile client", () => {
		const result = externalAuthRequestUseCase.execute(PRODUCTION, newClientType("mobile"), "/home");

		expect(result.isErr).toBe(false);
		if (!result.isErr) {
			const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = result.value;
			expect(state).toBeDefined();
			expect(codeVerifier).toBeDefined();
			expect(redirectToClientURL).toBeInstanceOf(URL);
			expect(redirectToProviderURL).toBeInstanceOf(URL);
			expect(redirectToClientURL.pathname).toBe("/home");
		}
	});

	it("should return INVALID_REDIRECT_URI error for invalid redirect URI", () => {
		const result = externalAuthRequestUseCase.execute(
			PRODUCTION,
			newClientType("web"),
			"https://malicious.com/redirect",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("INVALID_REDIRECT_URI");
		}
	});

	it("should handle empty redirect URI with default path", () => {
		const result = externalAuthRequestUseCase.execute(PRODUCTION, newClientType("web"), "");

		expect(result.isErr).toBe(false);
		if (!result.isErr) {
			const { redirectToClientURL } = result.value;
			expect(redirectToClientURL.pathname).toBe("/");
		}
	});
});
