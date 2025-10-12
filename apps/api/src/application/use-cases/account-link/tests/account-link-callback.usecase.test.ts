import { beforeEach, describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import { newClientType, newOAuthProvider, newOAuthProviderId } from "../../../../domain/value-object";
import { createOAuthAccountFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	OAuthAccountRepositoryMock,
	OAuthProviderGatewayMock,
	OAuthStateSignerMock,
	createOAuthAccountKey,
	createOAuthAccountsMap,
} from "../../../../tests/mocks";
import type { IAccountLinkCallbackUseCase } from "../../../ports/in";
import { AccountLinkCallbackUseCase } from "../account-link-callback.usecase";
import type { accountLinkStateSchema } from "../schemas";

const oauthAccountMap = createOAuthAccountsMap();

const oauthProviderGateway = new OAuthProviderGatewayMock();
const oauthAccountRepository = new OAuthAccountRepositoryMock({ oauthAccountMap });
const oauthStateSigner = new OAuthStateSignerMock<typeof accountLinkStateSchema>();

const accountLinkCallbackUseCase: IAccountLinkCallbackUseCase = new AccountLinkCallbackUseCase(
	oauthProviderGateway,
	oauthAccountRepository,
	oauthStateSigner,
);

const PRODUCTION = false;

const { user } = createUserFixture();

describe("AccountLinkCallbackUseCase", () => {
	beforeEach(() => {
		oauthAccountMap.clear();
	});

	it("should return OAUTH_CREDENTIALS_INVALID error for invalid state", async () => {
		const invalidState = "invalid_state";
		const provider = newOAuthProvider("discord");

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
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
		const userId = user.id;
		const signedState = oauthStateSigner.generate({ client: newClientType("web"), uid: userId });
		const provider = newOAuthProvider("discord");

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
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
		const userId = user.id;
		const signedState = oauthStateSigner.generate({ client: newClientType("web"), uid: userId });
		const provider = newOAuthProvider("discord");

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
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
		const userId = user.id;
		const signedState = oauthStateSigner.generate({ client: newClientType("web"), uid: userId });
		const provider = newOAuthProvider("discord");

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
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
		const userId = user.id;
		const signedState = oauthStateSigner.generate({ client: newClientType("web"), uid: userId });
		const provider = newOAuthProvider("discord");

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
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
		const userId = user.id;
		const provider = newOAuthProvider("discord");
		const providerId = newOAuthProviderId("different_provider_id");

		const { oauthAccount: existingOAuthAccount } = createOAuthAccountFixture({
			oauthAccount: {
				userId,
				provider,
				providerId,
			},
		});

		oauthAccountMap.set(createOAuthAccountKey(provider, providerId), existingOAuthAccount);

		const signedState = oauthStateSigner.generate({ client: newClientType("web"), uid: userId });

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
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
		const userId = user.id;
		const { user: anotherUser } = createUserFixture();
		const provider = newOAuthProvider("discord");
		const providerId = newOAuthProviderId("provider_user_id");

		const { oauthAccount: existingOAuthAccount } = createOAuthAccountFixture({
			oauthAccount: {
				userId: anotherUser.id,
				provider,
				providerId,
			},
		});

		oauthAccountMap.set(createOAuthAccountKey(provider, providerId), existingOAuthAccount);

		const signedState = oauthStateSigner.generate({ client: newClientType("web"), uid: userId });

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
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
		const userId = user.id;
		const provider = newOAuthProvider("discord");
		const signedState = oauthStateSigner.generate({ client: newClientType("web"), uid: userId });

		const result = await accountLinkCallbackUseCase.execute(
			PRODUCTION,
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
			expect(oauthAccountMap.size).toBe(1);
		}
	});
});
