import { describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import { newClientType } from "../../../../domain/value-object";
import { OAuthProviderGatewayMock, OAuthStateSignerMock } from "../../../../tests/mocks";
import { OAuthRequestUseCase } from "../oauth-request.usecase";
import type { oauthStateSchema } from "../schema";

const oauthProviderGateway = new OAuthProviderGatewayMock();
const oauthStateSigner = new OAuthStateSignerMock<typeof oauthStateSchema>();

const oauthRequestUseCase = new OAuthRequestUseCase(oauthProviderGateway, oauthStateSigner);

const PRODUCTION = false;

describe("OAuthRequestUseCase", () => {
	it("should generate OAuth request successfully for web client", () => {
		const result = oauthRequestUseCase.execute(PRODUCTION, newClientType("web"), "/dashboard");

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
		const result = oauthRequestUseCase.execute(PRODUCTION, newClientType("mobile"), "/home");

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
		const result = oauthRequestUseCase.execute(PRODUCTION, newClientType("web"), "https://malicious.com/redirect");

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("INVALID_REDIRECT_URL");
		}
	});

	it("should handle empty redirect URI with default path", () => {
		const result = oauthRequestUseCase.execute(PRODUCTION, newClientType("web"), "");

		expect(isErr(result)).toBe(false);
		if (!isErr(result)) {
			expect(result.redirectToClientURL.pathname).toBe("/");
		}
	});
});
