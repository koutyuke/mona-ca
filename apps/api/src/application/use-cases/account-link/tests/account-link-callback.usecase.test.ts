import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { createOAuthAccount } from "../../../../domain/entities";
import { newClientType, newOAuthProvider, newOAuthProviderId, newUserId } from "../../../../domain/value-object";
import { generateSignedState } from "../../../../interface-adapter/gateway/oauth-provider";
import {
	OAuthAccountRepositoryMock,
	OAuthProviderGatewayMock,
	createOAuthAccountKey,
	createOAuthAccountsMap,
} from "../../../../tests/mocks";
import { AccountLinkCallbackUseCase } from "../account-link-callback.usecase";
import type { IAccountLinkCallbackUseCase } from "../interfaces/account-link-callback.usecase.interface";

describe("AccountLinkCallbackUseCase", () => {
	const mockEnv = {
		APP_ENV: "development" as const,
		OAUTH_STATE_HMAC_SECRET: "test_secret",
	};

	let accountLinkCallbackUseCase: IAccountLinkCallbackUseCase;
	let oauthAccountRepositoryMock: OAuthAccountRepositoryMock;
	let oauthProviderGatewayMock: OAuthProviderGatewayMock;

	beforeEach(() => {
		const oauthAccountMap = createOAuthAccountsMap();

		oauthProviderGatewayMock = new OAuthProviderGatewayMock();
		oauthAccountRepositoryMock = new OAuthAccountRepositoryMock({ oauthAccountMap });

		accountLinkCallbackUseCase = new AccountLinkCallbackUseCase(
			mockEnv,
			oauthProviderGatewayMock,
			oauthAccountRepositoryMock,
		);
	});

	it("should return OAUTH_CREDENTIALS_INVALID error for invalid state", async () => {
		const invalidState = "invalid_state";
		const provider = newOAuthProvider("discord");

		const result = await accountLinkCallbackUseCase.execute(
			undefined,
			"/dashboard",
			provider,
			invalidState,
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_CREDENTIALS_INVALID");
		}
	});

	it("should return INVALID_REDIRECT_URL error for invalid redirect URI", async () => {
		const userId = newUserId(ulid());
		const signedState = generateSignedState(
			{ client: newClientType("web"), uid: userId },
			mockEnv.OAUTH_STATE_HMAC_SECRET,
		);
		const provider = newOAuthProvider("discord");

		const result = await accountLinkCallbackUseCase.execute(
			undefined,
			"https://malicious.com/redirect",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("INVALID_REDIRECT_URL");
		}
	});

	it("should return OAUTH_CREDENTIALS_INVALID error when code is missing", async () => {
		const userId = newUserId(ulid());
		const signedState = generateSignedState(
			{ client: newClientType("web"), uid: userId },
			mockEnv.OAUTH_STATE_HMAC_SECRET,
		);
		const provider = newOAuthProvider("discord");

		const result = await accountLinkCallbackUseCase.execute(
			undefined,
			"/dashboard",
			provider,
			signedState,
			undefined,
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_CREDENTIALS_INVALID");
		}
	});

	it("should return OAUTH_ACCESS_DENIED error when user denies access", async () => {
		const userId = newUserId(ulid());
		const signedState = generateSignedState(
			{ client: newClientType("web"), uid: userId },
			mockEnv.OAUTH_STATE_HMAC_SECRET,
		);
		const provider = newOAuthProvider("discord");

		const result = await accountLinkCallbackUseCase.execute(
			"access_denied",
			"/dashboard",
			provider,
			signedState,
			undefined,
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_ACCESS_DENIED");
		}
	});

	it("should return OAUTH_PROVIDER_ERROR error for provider error", async () => {
		const userId = newUserId(ulid());
		const signedState = generateSignedState(
			{ client: newClientType("web"), uid: userId },
			mockEnv.OAUTH_STATE_HMAC_SECRET,
		);
		const provider = newOAuthProvider("discord");

		const result = await accountLinkCallbackUseCase.execute(
			"server_error",
			"/dashboard",
			provider,
			signedState,
			undefined,
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_PROVIDER_ERROR");
		}
	});

	it("should return OAUTH_PROVIDER_ALREADY_LINKED error when user already has linked account for this provider", async () => {
		const userId = newUserId(ulid());
		const provider = newOAuthProvider("discord");
		const providerId = newOAuthProviderId("different_provider_id");

		// existing oauth account for this user and provider
		const existingOAuthAccount = createOAuthAccount({
			userId,
			provider,
			providerId,
		});

		oauthAccountRepositoryMock.oauthAccountMap.set(createOAuthAccountKey(provider, providerId), existingOAuthAccount);

		const signedState = generateSignedState(
			{ client: newClientType("web"), uid: userId },
			mockEnv.OAUTH_STATE_HMAC_SECRET,
		);

		const result = await accountLinkCallbackUseCase.execute(
			undefined,
			"/dashboard",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_PROVIDER_ALREADY_LINKED");
		}
	});

	it("should return OAUTH_ACCOUNT_ALREADY_LINKED_TO_ANOTHER_USER error when provider account is already linked to another user", async () => {
		const userId = newUserId(ulid());
		const anotherUserId = newUserId(ulid());
		const provider = newOAuthProvider("discord");
		const providerId = newOAuthProviderId("provider_user_id");

		// existing oauth account for another user
		const existingOAuthAccount = createOAuthAccount({
			userId: anotherUserId,
			provider,
			providerId,
		});

		oauthAccountRepositoryMock.oauthAccountMap.set(createOAuthAccountKey(provider, providerId), existingOAuthAccount);

		const signedState = generateSignedState(
			{ client: newClientType("web"), uid: userId },
			mockEnv.OAUTH_STATE_HMAC_SECRET,
		);

		const result = await accountLinkCallbackUseCase.execute(
			undefined,
			"/dashboard",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_ACCOUNT_ALREADY_LINKED_TO_ANOTHER_USER");
		}
	});

	it("should successfully link account when no conflicts", async () => {
		const userId = newUserId(ulid());
		const provider = newOAuthProvider("discord");
		const signedState = generateSignedState(
			{ client: newClientType("web"), uid: userId },
			mockEnv.OAUTH_STATE_HMAC_SECRET,
		);

		const result = await accountLinkCallbackUseCase.execute(
			undefined,
			"/dashboard",
			provider,
			signedState,
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(false);
		if (!isErr(result)) {
			expect(result.redirectURL).toBeInstanceOf(URL);
			expect(result.clientType).toBe(newClientType("web"));
			expect(oauthAccountRepositoryMock.oauthAccountMap.size).toBe(1);
		}
	});
});
