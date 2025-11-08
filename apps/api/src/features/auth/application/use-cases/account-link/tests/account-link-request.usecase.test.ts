import { beforeEach, describe, expect, it } from "vitest";
import { newClientType, newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { SessionSecretHasherMock } from "../../../../../../core/testing/mocks/system";
import { newExternalIdentityProvider } from "../../../../domain/value-objects/external-identity";
import type { AccountLinkSessionToken } from "../../../../domain/value-objects/session-token";
import { createAccountLinkSessionFixture } from "../../../../testing/fixtures";
import { OAuthProviderGatewayMock } from "../../../../testing/mocks/gateways";
import { HmacOAuthStateSignerMock } from "../../../../testing/mocks/infra";
import { AccountLinkSessionRepositoryMock, createAccountLinkSessionsMap } from "../../../../testing/mocks/repositories";
import { AccountLinkRequestUseCase } from "../account-link-request.usecase";
import type { accountLinkStateSchema } from "../schema";

const accountLinkSessionMap = createAccountLinkSessionsMap();
const sessionSecretHasher = new SessionSecretHasherMock();

const oauthProviderGateway = new OAuthProviderGatewayMock();
const accountLinkOAuthStateSigner = new HmacOAuthStateSignerMock<typeof accountLinkStateSchema>();
const accountLinkSessionRepository = new AccountLinkSessionRepositoryMock({ accountLinkSessionMap });

const accountLinkRequestUseCase = new AccountLinkRequestUseCase(
	oauthProviderGateway,
	oauthProviderGateway,
	accountLinkOAuthStateSigner,
	accountLinkSessionRepository,
	sessionSecretHasher,
);

const PRODUCTION = false;
const provider = newExternalIdentityProvider("google");

describe("AccountLinkRequestUseCase", () => {
	beforeEach(() => {
		accountLinkSessionMap.clear();
	});

	it("should generate account link request successfully for web client", async () => {
		const userId = newUserId(ulid());
		const { accountLinkSession, accountLinkSessionToken } = createAccountLinkSessionFixture({
			secretHasher: sessionSecretHasher.hash,
			accountLinkSession: { userId },
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const clientType = newClientType("web");
		const queryRedirectURI = "/settings/connections";

		const result = await accountLinkRequestUseCase.execute(
			PRODUCTION,
			clientType,
			provider,
			queryRedirectURI,
			accountLinkSessionToken,
		);

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

	it("should generate account link request successfully for mobile client", async () => {
		const userId = newUserId(ulid());
		const { accountLinkSession, accountLinkSessionToken } = createAccountLinkSessionFixture({
			secretHasher: sessionSecretHasher.hash,
			accountLinkSession: { userId },
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const clientType = newClientType("mobile");
		const queryRedirectURI = "/settings/connections";

		const result = await accountLinkRequestUseCase.execute(
			PRODUCTION,
			clientType,
			provider,
			queryRedirectURI,
			accountLinkSessionToken,
		);

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

	it("should return INVALID_REDIRECT_URI error for invalid redirect URI", async () => {
		const userId = newUserId(ulid());
		const { accountLinkSession, accountLinkSessionToken } = createAccountLinkSessionFixture({
			secretHasher: sessionSecretHasher.hash,
			accountLinkSession: { userId },
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const clientType = newClientType("web");
		const invalidRedirectURI = "https://malicious.com/redirect";

		const result = await accountLinkRequestUseCase.execute(
			PRODUCTION,
			clientType,
			provider,
			invalidRedirectURI,
			accountLinkSessionToken,
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("INVALID_REDIRECT_URI");
		}
	});

	it("should return ACCOUNT_LINK_SESSION_INVALID error for invalid session token format", async () => {
		const clientType = newClientType("web");
		const queryRedirectURI = "/settings/connections";
		const invalidToken = "invalid-token-without-dot" as AccountLinkSessionToken;

		const result = await accountLinkRequestUseCase.execute(
			PRODUCTION,
			clientType,
			provider,
			queryRedirectURI,
			invalidToken,
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_LINK_SESSION_INVALID");
		}
	});

	it("should return ACCOUNT_LINK_SESSION_INVALID error for non-existent session", async () => {
		const userId = newUserId(ulid());
		const { accountLinkSessionToken } = createAccountLinkSessionFixture({
			secretHasher: sessionSecretHasher.hash,
			accountLinkSession: { userId },
		});
		// Don't add session to map

		const clientType = newClientType("web");
		const queryRedirectURI = "/settings/connections";

		const result = await accountLinkRequestUseCase.execute(
			PRODUCTION,
			clientType,
			provider,
			queryRedirectURI,
			accountLinkSessionToken,
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_LINK_SESSION_INVALID");
		}
	});

	it("should return ACCOUNT_LINK_SESSION_EXPIRED error for expired session", async () => {
		const userId = newUserId(ulid());
		const { accountLinkSession, accountLinkSessionToken } = createAccountLinkSessionFixture({
			secretHasher: sessionSecretHasher.hash,
			accountLinkSession: {
				userId,
				expiresAt: new Date(0), // Expired
			},
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const clientType = newClientType("web");
		const queryRedirectURI = "/settings/connections";

		const result = await accountLinkRequestUseCase.execute(
			PRODUCTION,
			clientType,
			provider,
			queryRedirectURI,
			accountLinkSessionToken,
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_LINK_SESSION_EXPIRED");
			// Session should be deleted
			expect(accountLinkSessionMap.size).toBe(0);
		}
	});

	it("should return ACCOUNT_LINK_SESSION_INVALID error for invalid secret", async () => {
		const userId = newUserId(ulid());
		const { accountLinkSession, accountLinkSessionToken } = createAccountLinkSessionFixture({
			secretHasher: sessionSecretHasher.hash,
			accountLinkSession: { userId },
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const clientType = newClientType("web");
		const queryRedirectURI = "/settings/connections";
		// Tamper with the secret part of the token
		const [sessionId] = accountLinkSessionToken.split(".");
		const tamperedToken = `${sessionId}.wrongsecret` as AccountLinkSessionToken;

		const result = await accountLinkRequestUseCase.execute(
			PRODUCTION,
			clientType,
			provider,
			queryRedirectURI,
			tamperedToken,
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_LINK_SESSION_INVALID");
			// Session should be deleted due to invalid secret
			expect(accountLinkSessionMap.size).toBe(0);
		}
	});

	it("should use default redirect URI when empty string is provided", async () => {
		const userId = newUserId(ulid());
		const { accountLinkSession, accountLinkSessionToken } = createAccountLinkSessionFixture({
			secretHasher: sessionSecretHasher.hash,
			accountLinkSession: { userId },
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const clientType = newClientType("web");
		const emptyRedirectURI = "";

		const result = await accountLinkRequestUseCase.execute(
			PRODUCTION,
			clientType,
			provider,
			emptyRedirectURI,
			accountLinkSessionToken,
		);

		expect(result.isErr).toBe(false);
		if (!result.isErr) {
			const { redirectToClientURL } = result.value;
			expect(redirectToClientURL.pathname).toBe("/");
		}
	});

	it("should include sessionId in the generated state", async () => {
		const userId = newUserId(ulid());
		const { accountLinkSession, accountLinkSessionToken } = createAccountLinkSessionFixture({
			secretHasher: sessionSecretHasher.hash,
			accountLinkSession: { userId },
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const clientType = newClientType("web");
		const queryRedirectURI = "/settings/connections";

		const result = await accountLinkRequestUseCase.execute(
			PRODUCTION,
			clientType,
			provider,
			queryRedirectURI,
			accountLinkSessionToken,
		);

		expect(result.isErr).toBe(false);
		if (!result.isErr) {
			const { state } = result.value;
			const validatedState = accountLinkOAuthStateSigner.validate(state);
			expect(validatedState.isErr).toBe(false);
			if (!validatedState.isErr) {
				expect(validatedState.value.uid).toBe(userId);
				expect(validatedState.value.client).toBe(clientType);
			}
		}
	});
});
