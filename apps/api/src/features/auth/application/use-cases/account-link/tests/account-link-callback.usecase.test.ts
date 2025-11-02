import { beforeEach, describe, expect, it } from "vitest";
import { newClientType, newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import {
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
} from "../../../../domain/value-objects/external-identity";
import {
	createAccountLinkSessionFixture,
	createAuthUserFixture,
	createExternalIdentityFixture,
} from "../../../../testing/fixtures";
import { OAuthProviderGatewayMock } from "../../../../testing/mocks/gateways";
import { HmacOAuthStateSignerMock } from "../../../../testing/mocks/infra";
import {
	AccountLinkSessionRepositoryMock,
	ExternalIdentityRepositoryMock,
	createAccountLinkSessionsMap,
	createExternalIdentitiesMap,
	createExternalIdentityKey,
} from "../../../../testing/mocks/repositories";
import type { IAccountLinkCallbackUseCase } from "../../../contracts/account-link/account-link-callback.usecase.interface";
import { AccountLinkCallbackUseCase } from "../account-link-callback.usecase";
import type { accountLinkStateSchema } from "../schema";

const externalIdentityMap = createExternalIdentitiesMap();
const accountLinkSessionMap = createAccountLinkSessionsMap();

const oauthProviderGateway = new OAuthProviderGatewayMock();
const externalIdentityRepository = new ExternalIdentityRepositoryMock({ externalIdentityMap });
const accountLinkOAuthStateSigner = new HmacOAuthStateSignerMock<typeof accountLinkStateSchema>();
const accountLinkSessionRepository = new AccountLinkSessionRepositoryMock({ accountLinkSessionMap });

const accountLinkCallbackUseCase: IAccountLinkCallbackUseCase = new AccountLinkCallbackUseCase(
	oauthProviderGateway,
	oauthProviderGateway,
	externalIdentityRepository,
	accountLinkOAuthStateSigner,
	accountLinkSessionRepository,
);

const PRODUCTION = false;
const provider = newExternalIdentityProvider("discord");
const { userRegistration } = createAuthUserFixture();

describe("AccountLinkCallbackUseCase", () => {
	beforeEach(() => {
		externalIdentityMap.clear();
		accountLinkSessionMap.clear();
	});

	it("should return INVALID_STATE error for invalid state", async () => {
		const invalidState = "invalid_state";

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			provider,
			invalidState,
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("INVALID_STATE");
		}
	});

	it("should return ACCOUNT_LINK_SESSION_INVALID error when session not found", async () => {
		const userId = userRegistration.id;
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: { userId },
		});
		// Create state but don't save session
		const signedState = accountLinkOAuthStateSigner.generate({
			client: newClientType("web"),
			uid: userId,
			sid: accountLinkSession.id,
		});

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_LINK_SESSION_INVALID");
		}
	});

	it("should delete session immediately and return error if expired", async () => {
		const userId = userRegistration.id;
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId,
				expiresAt: new Date(0), // Expired
			},
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const signedState = accountLinkOAuthStateSigner.generate({
			client: newClientType("web"),
			uid: userId,
			sid: accountLinkSession.id,
		});

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_LINK_SESSION_EXPIRED");
			// Session should be deleted
			expect(accountLinkSessionMap.size).toBe(0);
		}
	});

	it("should return ACCOUNT_LINK_SESSION_INVALID error when userId mismatch", async () => {
		const sessionUserId = newUserId(ulid());
		const stateUserId = newUserId(ulid()); // Different user
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: { userId: sessionUserId },
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const signedState = accountLinkOAuthStateSigner.generate({
			client: newClientType("web"),
			uid: stateUserId, // Different from session
			sid: accountLinkSession.id,
		});

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_LINK_SESSION_INVALID");
			// Session should be deleted
			expect(accountLinkSessionMap.size).toBe(0);
		}
	});

	it("should return INVALID_REDIRECT_URI error for invalid redirect URI", async () => {
		const userId = userRegistration.id;
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: { userId },
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const signedState = accountLinkOAuthStateSigner.generate({
			client: newClientType("web"),
			uid: userId,
			sid: accountLinkSession.id,
		});

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"https://malicious.com/redirect",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("INVALID_REDIRECT_URI");
			// Session should still be deleted
			expect(accountLinkSessionMap.size).toBe(0);
		}
	});

	it("should return TOKEN_EXCHANGE_FAILED error when code is missing", async () => {
		const userId = userRegistration.id;
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: { userId },
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const signedState = accountLinkOAuthStateSigner.generate({
			client: newClientType("web"),
			uid: userId,
			sid: accountLinkSession.id,
		});

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			provider,
			signedState,
			undefined,
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("TOKEN_EXCHANGE_FAILED");
			// Session should still be deleted
			expect(accountLinkSessionMap.size).toBe(0);
		}
	});

	it("should return PROVIDER_ACCESS_DENIED error when user denies access", async () => {
		const userId = userRegistration.id;
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: { userId },
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const signedState = accountLinkOAuthStateSigner.generate({
			client: newClientType("web"),
			uid: userId,
			sid: accountLinkSession.id,
		});

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
			"access_denied",
			"/dashboard",
			provider,
			signedState,
			undefined,
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("PROVIDER_ACCESS_DENIED");
			// Session should still be deleted
			expect(accountLinkSessionMap.size).toBe(0);
		}
	});

	it("should return PROVIDER_ERROR error for provider error", async () => {
		const userId = userRegistration.id;
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: { userId },
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const signedState = accountLinkOAuthStateSigner.generate({
			client: newClientType("web"),
			uid: userId,
			sid: accountLinkSession.id,
		});

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
			"server_error",
			"/dashboard",
			provider,
			signedState,
			undefined,
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("PROVIDER_ERROR");
			// Session should still be deleted
			expect(accountLinkSessionMap.size).toBe(0);
		}
	});

	it("should return PROVIDER_ALREADY_LINKED error when user already has linked account for this provider", async () => {
		const userId = userRegistration.id;
		const providerId = newExternalIdentityProviderUserId("different_provider_id");

		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: { userId },
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const { externalIdentity: existingOAuthAccount } = createExternalIdentityFixture({
			externalIdentity: {
				userId,
				provider,
				providerUserId: providerId,
			},
		});
		externalIdentityMap.set(createExternalIdentityKey(provider, providerId), existingOAuthAccount);

		const signedState = accountLinkOAuthStateSigner.generate({
			client: newClientType("web"),
			uid: userId,
			sid: accountLinkSession.id,
		});

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("PROVIDER_ALREADY_LINKED");
			// Session should still be deleted
			expect(accountLinkSessionMap.size).toBe(0);
		}
	});

	it("should return ACCOUNT_LINKED_ELSEWHERE error when provider account is already linked to another user", async () => {
		const userId = userRegistration.id;
		const { userRegistration: anotherUser } = createAuthUserFixture();
		const providerId = newExternalIdentityProviderUserId("provider_user_id");

		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: { userId },
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const { externalIdentity: existingOAuthAccount } = createExternalIdentityFixture({
			externalIdentity: {
				userId: anotherUser.id,
				provider,
				providerUserId: providerId,
			},
		});
		externalIdentityMap.set(createExternalIdentityKey(provider, providerId), existingOAuthAccount);

		const signedState = accountLinkOAuthStateSigner.generate({
			client: newClientType("web"),
			uid: userId,
			sid: accountLinkSession.id,
		});

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_LINKED_ELSEWHERE");
			// Session should still be deleted
			expect(accountLinkSessionMap.size).toBe(0);
		}
	});

	it("should successfully link account when no conflicts", async () => {
		const userId = userRegistration.id;
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: { userId },
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const signedState = accountLinkOAuthStateSigner.generate({
			client: newClientType("web"),
			uid: userId,
			sid: accountLinkSession.id,
		});

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(false);
		if (!result.isErr) {
			const { redirectURL, clientType } = result.value;
			expect(redirectURL).toBeInstanceOf(URL);
			expect(clientType).toBe(newClientType("web"));
			expect(externalIdentityMap.size).toBe(1);
			// Session should be deleted after successful link
			expect(accountLinkSessionMap.size).toBe(0);
		}
	});

	it("should delete session even on success", async () => {
		const userId = userRegistration.id;
		const { accountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: { userId },
		});
		accountLinkSessionMap.set(accountLinkSession.id, accountLinkSession);

		const signedState = accountLinkOAuthStateSigner.generate({
			client: newClientType("mobile"),
			uid: userId,
			sid: accountLinkSession.id,
		});

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(false);
		// Session should be deleted
		expect(accountLinkSessionMap.size).toBe(0);
	});
});
