import { describe, expect, it } from "vitest";
import { newClientType, newUserId } from "../../../../../../shared/domain/value-objects";
import { ulid } from "../../../../../../shared/lib/id";
import { newExternalIdentityProvider } from "../../../../domain/value-objects/external-identity";
import { OAuthProviderGatewayMock } from "../../../../testing/mocks/gateways";
import { HmacOAuthStateSignerMock } from "../../../../testing/mocks/infra";
import { AccountLinkRequestUseCase } from "../account-link-request.usecase";
import type { accountLinkStateSchema } from "../schema";

const oauthProviderGateway = new OAuthProviderGatewayMock();
const accountLinkOAuthStateSigner = new HmacOAuthStateSignerMock<typeof accountLinkStateSchema>();

const accountLinkRequestUseCase = new AccountLinkRequestUseCase(
	oauthProviderGateway,
	oauthProviderGateway,
	accountLinkOAuthStateSigner,
);

const PRODUCTION = false;

const provider = newExternalIdentityProvider("google");

describe("ExternalAuthRequestUseCase", () => {
	it("should generate account link request successfully for web client", () => {
		const clientType = newClientType("web");
		const queryRedirectURI = "/settings/connections";
		const userId = newUserId(ulid());

		const result = accountLinkRequestUseCase.execute(PRODUCTION, clientType, provider, queryRedirectURI, userId);

		expect(result.isErr).toBe(false);
		if (!result.isErr) {
			const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = result.value;
			expect(state).toBeDefined();
			expect(codeVerifier).toBeDefined();
			expect(redirectToClientURL).toBeInstanceOf(URL);
			expect(redirectToProviderURL).toBeInstanceOf(URL);
			expect(redirectToClientURL.pathname).toBe("/settings/connections");
		}
	});

	it("should generate account link request successfully for mobile client", () => {
		const clientType = newClientType("mobile");
		const queryRedirectURI = "/settings/connections";
		const userId = newUserId(ulid());

		const result = accountLinkRequestUseCase.execute(PRODUCTION, clientType, provider, queryRedirectURI, userId);

		expect(result.isErr).toBe(false);
		if (!result.isErr) {
			const { state, codeVerifier, redirectToClientURL, redirectToProviderURL } = result.value;
			expect(state).toBeDefined();
			expect(codeVerifier).toBeDefined();
			expect(redirectToClientURL).toBeInstanceOf(URL);
			expect(redirectToProviderURL).toBeInstanceOf(URL);
			expect(redirectToClientURL.pathname).toBe("/settings/connections");
		}
	});

	it("should return INVALID_REDIRECT_URI error for invalid redirect URI", () => {
		const clientType = newClientType("web");
		const invalidRedirectURI = "https://malicious.com/redirect";
		const userId = newUserId(ulid());

		const result = accountLinkRequestUseCase.execute(PRODUCTION, clientType, provider, invalidRedirectURI, userId);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("INVALID_REDIRECT_URI");
		}
	});

	it("should use default redirect URI when empty string is provided", () => {
		const clientType = newClientType("web");
		const emptyRedirectURI = "";
		const userId = newUserId(ulid());

		const result = accountLinkRequestUseCase.execute(PRODUCTION, clientType, provider, emptyRedirectURI, userId);

		expect(result.isErr).toBe(false);
		if (!result.isErr) {
			const { redirectToClientURL } = result.value;
			expect(redirectToClientURL.pathname).toBe("/");
		}
	});

	it("should generate different states for different users", () => {
		const clientType = newClientType("web");
		const queryRedirectURI = "/settings/connections";
		const userId1 = newUserId(ulid());
		const userId2 = newUserId(ulid());

		const result1 = accountLinkRequestUseCase.execute(PRODUCTION, clientType, provider, queryRedirectURI, userId1);
		const result2 = accountLinkRequestUseCase.execute(PRODUCTION, clientType, provider, queryRedirectURI, userId2);

		expect(result1.isErr).toBe(false);
		expect(result2.isErr).toBe(false);
		if (!result1.isErr && !result2.isErr) {
			const { state: state1 } = result1.value;
			const { state: state2 } = result2.value;
			expect(state1).not.toBe(state2);
		}
	});
});
