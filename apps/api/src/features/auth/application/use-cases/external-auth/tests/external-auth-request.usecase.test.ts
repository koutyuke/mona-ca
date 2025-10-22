import { describe, expect, it } from "vitest";
import { newClientType } from "../../../../../../core/domain/value-objects";
import { newExternalIdentityProvider } from "../../../../domain/value-objects/external-identity";
import { OAuthProviderGatewayMock } from "../../../../testing/mocks/gateways";
import { HmacOAuthStateSignerMock } from "../../../../testing/mocks/infra";
import { ExternalAuthRequestUseCase } from "../external-auth-request.usecase";
import type { oauthStateSchema } from "../schema";

const oauthProviderGateway = new OAuthProviderGatewayMock();
const externalAuthOAuthStateSigner = new HmacOAuthStateSignerMock<typeof oauthStateSchema>();

const externalAuthRequestUseCase = new ExternalAuthRequestUseCase(
	oauthProviderGateway,
	oauthProviderGateway,
	externalAuthOAuthStateSigner,
);

const PRODUCTION = false;

const provider = newExternalIdentityProvider("google");

describe("ExternalAuthRequestUseCase", () => {
	it("should generate ExternalAuth request successfully for web client", () => {
		const result = externalAuthRequestUseCase.execute(PRODUCTION, newClientType("web"), provider, "/dashboard");

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
		const result = externalAuthRequestUseCase.execute(PRODUCTION, newClientType("mobile"), provider, "/home");

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
			provider,
			"https://malicious.com/redirect",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("INVALID_REDIRECT_URI");
		}
	});

	it("should handle empty redirect URI with default path", () => {
		const result = externalAuthRequestUseCase.execute(PRODUCTION, newClientType("web"), provider, "");

		expect(result.isErr).toBe(false);
		if (!result.isErr) {
			const { redirectToClientURL } = result.value;
			expect(redirectToClientURL.pathname).toBe("/");
		}
	});
});
