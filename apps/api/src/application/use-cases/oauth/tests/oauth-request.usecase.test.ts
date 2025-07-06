import { describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import { newClientType } from "../../../../domain/value-object";
import { OAuthProviderGatewayMock } from "../../../../tests/mocks";
import { OAuthRequestUseCase } from "../oauth-request.usecase";

describe("OAuthRequestUseCase", () => {
	const mockEnv = {
		APP_ENV: "development" as const,
		OAUTH_STATE_HMAC_SECRET: "test_secret",
	};

	const oauthProviderGatewayMock = new OAuthProviderGatewayMock();
	const oauthRequestUseCase = new OAuthRequestUseCase(mockEnv, oauthProviderGatewayMock);

	it("should generate OAuth request successfully for web client", () => {
		const clientType = newClientType("web");
		const queryRedirectURI = "/dashboard";

		const result = oauthRequestUseCase.execute(clientType, queryRedirectURI);

		expect(isErr(result)).toBe(false);
		if (!isErr(result)) {
			expect(result.state).toBeDefined();
			expect(result.codeVerifier).toBeDefined();
			expect(result.redirectToClientURL).toBeInstanceOf(URL);
			expect(result.redirectToProviderURL).toBeInstanceOf(URL);
			expect(result.redirectToClientURL.pathname).toBe("/dashboard");
		}
	});

	it("should generate OAuth request successfully for mobile client", () => {
		const clientType = newClientType("mobile");
		const queryRedirectURI = "/home";

		const result = oauthRequestUseCase.execute(clientType, queryRedirectURI);

		expect(isErr(result)).toBe(false);
		if (!isErr(result)) {
			expect(result.state).toBeDefined();
			expect(result.codeVerifier).toBeDefined();
			expect(result.redirectToClientURL).toBeInstanceOf(URL);
			expect(result.redirectToProviderURL).toBeInstanceOf(URL);
			expect(result.redirectToClientURL.pathname).toBe("/home");
		}
	});

	it("should return INVALID_REDIRECT_URL error for invalid redirect URI", () => {
		const clientType = newClientType("web");
		const queryRedirectURI = "https://malicious.com/redirect";

		const result = oauthRequestUseCase.execute(clientType, queryRedirectURI);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("INVALID_REDIRECT_URL");
		}
	});

	it("should handle empty redirect URI with default path", () => {
		const clientType = newClientType("web");
		const queryRedirectURI = "";

		const result = oauthRequestUseCase.execute(clientType, queryRedirectURI);

		expect(isErr(result)).toBe(false);
		if (!isErr(result)) {
			expect(result.redirectToClientURL.pathname).toBe("/");
		}
	});

	it("should generate different state and code verifier for each request", () => {
		const clientType = newClientType("web");
		const queryRedirectURI = "/dashboard";

		const result1 = oauthRequestUseCase.execute(clientType, queryRedirectURI);
		const result2 = oauthRequestUseCase.execute(clientType, queryRedirectURI);

		expect(isErr(result1)).toBe(false);
		expect(isErr(result2)).toBe(false);

		if (!isErr(result1) && !isErr(result2)) {
			expect(result1.state).not.toBe(result2.state);
			expect(result1.codeVerifier).not.toBe(result2.codeVerifier);
		}
	});
});
