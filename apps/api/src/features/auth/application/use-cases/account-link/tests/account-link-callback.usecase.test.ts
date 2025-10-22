import { beforeEach, describe, expect, it } from "vitest";
import { newClientType } from "../../../../../../core/domain/value-objects";
import {
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
} from "../../../../domain/value-objects/external-identity";
import { createAuthUserFixture, createExternalIdentityFixture } from "../../../../testing/fixtures";
import { OAuthProviderGatewayMock } from "../../../../testing/mocks/gateways";
import { HmacOAuthStateSignerMock } from "../../../../testing/mocks/infra";
import {
	ExternalIdentityRepositoryMock,
	createExternalIdentitiesMap,
	createExternalIdentityKey,
} from "../../../../testing/mocks/repositories";
import type { IAccountLinkCallbackUseCase } from "../../../contracts/account-link/account-link-callback.usecase.interface";
import { AccountLinkCallbackUseCase } from "../account-link-callback.usecase";
import type { accountLinkStateSchema } from "../schema";

const externalIdentityMap = createExternalIdentitiesMap();

const oauthProviderGateway = new OAuthProviderGatewayMock();
const externalIdentityRepository = new ExternalIdentityRepositoryMock({ externalIdentityMap });
const accountLinkOAuthStateSigner = new HmacOAuthStateSignerMock<typeof accountLinkStateSchema>();

const accountLinkCallbackUseCase: IAccountLinkCallbackUseCase = new AccountLinkCallbackUseCase(
	oauthProviderGateway,
	oauthProviderGateway,
	externalIdentityRepository,
	accountLinkOAuthStateSigner,
);

const PRODUCTION = false;

const provider = newExternalIdentityProvider("discord");

const { userRegistration } = createAuthUserFixture();

describe("AccountLinkCallbackUseCase", () => {
	beforeEach(() => {
		externalIdentityMap.clear();
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

	it("should return INVALID_REDIRECT_URI error for invalid redirect URI", async () => {
		const userId = userRegistration.id;
		const signedState = accountLinkOAuthStateSigner.generate({ client: newClientType("web"), uid: userId });

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
		}
	});

	it("should return TOKEN_EXCHANGE_FAILED error when code is missing", async () => {
		const userId = userRegistration.id;
		const signedState = accountLinkOAuthStateSigner.generate({ client: newClientType("web"), uid: userId });

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
		}
	});

	it("should return PROVIDER_ACCESS_DENIED error when user denies access", async () => {
		const userId = userRegistration.id;
		const signedState = accountLinkOAuthStateSigner.generate({ client: newClientType("web"), uid: userId });

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
		}
	});

	it("should return PROVIDER_ERROR error for provider error", async () => {
		const userId = userRegistration.id;
		const signedState = accountLinkOAuthStateSigner.generate({ client: newClientType("web"), uid: userId });

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
		}
	});

	it("should return PROVIDER_ALREADY_LINKED error when user already has linked account for this provider", async () => {
		const userId = userRegistration.id;
		const providerId = newExternalIdentityProviderUserId("different_provider_id");

		const { externalIdentity: existingOAuthAccount } = createExternalIdentityFixture({
			externalIdentity: {
				userId,
				provider,
				providerUserId: providerId,
			},
		});

		externalIdentityMap.set(createExternalIdentityKey(provider, providerId), existingOAuthAccount);

		const signedState = accountLinkOAuthStateSigner.generate({ client: newClientType("web"), uid: userId });

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
		}
	});

	it("should return ACCOUNT_LINKED_ELSEWHERE error when provider account is already linked to another user", async () => {
		const userId = userRegistration.id;
		const { userRegistration: anotherUser } = createAuthUserFixture();
		const providerId = newExternalIdentityProviderUserId("provider_user_id");

		const { externalIdentity: existingOAuthAccount } = createExternalIdentityFixture({
			externalIdentity: {
				userId: anotherUser.id,
				provider,
				providerUserId: providerId,
			},
		});

		externalIdentityMap.set(createExternalIdentityKey(provider, providerId), existingOAuthAccount);

		const signedState = accountLinkOAuthStateSigner.generate({ client: newClientType("web"), uid: userId });

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
		}
	});

	it("should successfully link account when no conflicts", async () => {
		const userId = userRegistration.id;
		const signedState = accountLinkOAuthStateSigner.generate({ client: newClientType("web"), uid: userId });

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
		}
	});
});
