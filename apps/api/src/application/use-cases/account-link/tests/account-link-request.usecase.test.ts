import { describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { newClientType, newUserId } from "../../../../domain/value-object";
import { OAuthProviderGatewayMock, OAuthStateSignerMock } from "../../../../tests/mocks";
import { AccountLinkRequestUseCase } from "../account-link-request.usecase";
import type { accountLinkStateSchema } from "../schema";

const oauthProviderGateway = new OAuthProviderGatewayMock();
const oauthStateSigner = new OAuthStateSignerMock<typeof accountLinkStateSchema>();

const accountLinkRequestUseCase = new AccountLinkRequestUseCase(oauthProviderGateway, oauthStateSigner);

const PRODUCTION = false;

describe("ExternalAuthRequestUseCase", () => {
	it("should generate account link request successfully for web client", () => {
		const clientType = newClientType("web");
		const queryRedirectURI = "/settings/connections";
		const userId = newUserId(ulid());

		const result = accountLinkRequestUseCase.execute(PRODUCTION, clientType, queryRedirectURI, userId);

		expect(isErr(result)).toBe(false);
		if (!isErr(result)) {
			expect(result.state).toBeDefined();
			expect(result.codeVerifier).toBeDefined();
			expect(result.redirectToClientURL).toBeInstanceOf(URL);
			expect(result.redirectToProviderURL).toBeInstanceOf(URL);
			expect(result.redirectToClientURL.pathname).toBe("/settings/connections");
		}
	});

	it("should generate account link request successfully for mobile client", () => {
		const clientType = newClientType("mobile");
		const queryRedirectURI = "/settings/connections";
		const userId = newUserId(ulid());

		const result = accountLinkRequestUseCase.execute(PRODUCTION, clientType, queryRedirectURI, userId);

		expect(isErr(result)).toBe(false);
		if (!isErr(result)) {
			expect(result.state).toBeDefined();
			expect(result.codeVerifier).toBeDefined();
			expect(result.redirectToClientURL).toBeInstanceOf(URL);
			expect(result.redirectToProviderURL).toBeInstanceOf(URL);
			expect(result.redirectToClientURL.pathname).toBe("/settings/connections");
		}
	});

	it("should return INVALID_REDIRECT_URI error for invalid redirect URI", () => {
		const clientType = newClientType("web");
		const invalidRedirectURI = "https://malicious.com/redirect";
		const userId = newUserId(ulid());

		const result = accountLinkRequestUseCase.execute(PRODUCTION, clientType, invalidRedirectURI, userId);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("INVALID_REDIRECT_URI");
		}
	});

	it("should use default redirect URI when empty string is provided", () => {
		const clientType = newClientType("web");
		const emptyRedirectURI = "";
		const userId = newUserId(ulid());

		const result = accountLinkRequestUseCase.execute(PRODUCTION, clientType, emptyRedirectURI, userId);

		expect(isErr(result)).toBe(false);
		if (!isErr(result)) {
			expect(result.redirectToClientURL.pathname).toBe("/");
		}
	});

	it("should generate different states for different users", () => {
		const clientType = newClientType("web");
		const queryRedirectURI = "/settings/connections";
		const userId1 = newUserId(ulid());
		const userId2 = newUserId(ulid());

		const result1 = accountLinkRequestUseCase.execute(PRODUCTION, clientType, queryRedirectURI, userId1);
		const result2 = accountLinkRequestUseCase.execute(PRODUCTION, clientType, queryRedirectURI, userId2);

		expect(isErr(result1)).toBe(false);
		expect(isErr(result2)).toBe(false);
		if (!isErr(result1) && !isErr(result2)) {
			expect(result1.state).not.toBe(result2.state);
		}
	});
});
