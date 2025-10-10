import { beforeEach, describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import { DEFAULT_USER_GENDER } from "../../../../domain/entities";
import { newClientType, newGender, newOAuthProvider, newOAuthProviderId } from "../../../../domain/value-object";
import { generateSignedState } from "../../../../interface-adapter/gateway/oauth-provider";
import { createOAuthAccountFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	AccountAssociationSessionRepositoryMock,
	OAuthAccountRepositoryMock,
	OAuthProviderGatewayMock,
	SessionRepositoryMock,
	UserRepositoryMock,
	createAccountAssociationSessionsMap,
	createOAuthAccountKey,
	createOAuthAccountsMap,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import { OAuthLoginCallbackUseCase } from "../oauth-login-callback.usecase";

const mockEnv = {
	APP_ENV: "development" as const,
	OAUTH_STATE_HMAC_SECRET: "test_secret",
};

const userMap = createUsersMap();
const sessionMap = createSessionsMap();
const userPasswordHashMap = createUserPasswordHashMap();
const oauthAccountMap = createOAuthAccountsMap();
const accountAssociationSessionMap = createAccountAssociationSessionsMap();
const oauthProviderGatewayMock = new OAuthProviderGatewayMock();
const sessionRepositoryMock = new SessionRepositoryMock({ sessionMap });
const oauthAccountRepositoryMock = new OAuthAccountRepositoryMock({ oauthAccountMap });
const userRepositoryMock = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
	sessionMap,
});
const accountAssociationSessionRepositoryMock = new AccountAssociationSessionRepositoryMock({
	accountAssociationSessionMap,
});
const oauthLoginCallbackUseCase = new OAuthLoginCallbackUseCase(
	mockEnv,
	oauthProviderGatewayMock,
	sessionRepositoryMock,
	oauthAccountRepositoryMock,
	userRepositoryMock,
	accountAssociationSessionRepositoryMock,
);

const { user } = createUserFixture({
	user: {
		gender: newGender(DEFAULT_USER_GENDER),
	},
});

describe("OAuthLoginCallbackUseCase", () => {
	beforeEach(() => {
		userMap.clear();
		sessionMap.clear();
		userPasswordHashMap.clear();
		oauthAccountMap.clear();
		accountAssociationSessionMap.clear();
	});

	it("should return INVALID_OAUTH_STATE error for invalid state", async () => {
		const result = await oauthLoginCallbackUseCase.execute(
			undefined,
			"/dashboard",
			newOAuthProvider("discord"),
			"invalid_state",
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("INVALID_OAUTH_STATE");
		}
	});

	it("should return INVALID_REDIRECT_URL error for invalid redirect URI", async () => {
		const signedState = generateSignedState({ client: newClientType("web") }, mockEnv.OAUTH_STATE_HMAC_SECRET);

		const result = await oauthLoginCallbackUseCase.execute(
			undefined,
			"https://malicious.com/redirect",
			newOAuthProvider("discord"),
			signedState ?? "",
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("INVALID_REDIRECT_URL");
		}
	});

	it("should return OAUTH_ACCOUNT_NOT_FOUND error when OAuth account does not exist", async () => {
		const signedState = generateSignedState({ client: "web" }, mockEnv.OAUTH_STATE_HMAC_SECRET);

		const result = await oauthLoginCallbackUseCase.execute(
			undefined,
			"/dashboard",
			newOAuthProvider("discord"),
			signedState ?? "",
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("OAUTH_ACCOUNT_NOT_FOUND");
		}
	});

	it("should process successful login when OAuth account exists", async () => {
		const oauthAccountFixture = createOAuthAccountFixture({
			oauthAccount: {
				userId: user.id,
				provider: newOAuthProvider("discord"),
				providerId: newOAuthProviderId("provider_user_id"),
			},
		});

		userMap.set(user.id, user);
		oauthAccountMap.set(
			createOAuthAccountKey(oauthAccountFixture.oauthAccount.provider, oauthAccountFixture.oauthAccount.providerId),
			oauthAccountFixture.oauthAccount,
		);

		const signedState = generateSignedState({ client: newClientType("web") }, mockEnv.OAUTH_STATE_HMAC_SECRET);

		const result = await oauthLoginCallbackUseCase.execute(
			undefined,
			"/dashboard",
			newOAuthProvider("discord"),
			signedState ?? "",
			"auth_code",
			"code_verifier",
		);

		expect(isErr(result)).toBe(false);
		if (!isErr(result)) {
			expect(result.session.userId).toBe(user.id);
			expect(result.sessionToken).toBeDefined();
			expect(result.redirectURL).toBeInstanceOf(URL);
			expect(result.clientType).toBe("web");
			const savedSession = sessionMap.get(result.session.id);
			expect(savedSession).toBeDefined();
		}
	});
});
