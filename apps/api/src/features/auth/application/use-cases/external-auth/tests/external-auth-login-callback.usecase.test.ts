import { beforeEach, describe, expect, it } from "vitest";
import { newClientType, newGender } from "../../../../../../shared/domain/value-objects";
import { OAuthStateSignerMock, SessionSecretHasherMock } from "../../../../../../shared/testing/mocks/system";
import { DEFAULT_USER_GENDER } from "../../../../domain/entities/user-registration";
import {
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
} from "../../../../domain/value-objects/external-identity";
import { createAuthUserFixture, createExternalIdentityFixture } from "../../../../testing/fixtures";
import { OAuthProviderGatewayMock } from "../../../../testing/mocks/gateways";
import {
	AccountAssociationSessionRepositoryMock,
	AuthUserRepositoryMock,
	ExternalIdentityRepositoryMock,
	SessionRepositoryMock,
	createAccountAssociationSessionsMap,
	createAuthUsersMap,
	createExternalIdentitiesMap,
	createExternalIdentityKey,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { ExternalAuthLoginCallbackUseCase } from "../external-auth-login-callback.usecase";
import type { oauthStateSchema } from "../schema";

const authUserMap = createAuthUsersMap();
const sessionMap = createSessionsMap();
const externalIdentityMap = createExternalIdentitiesMap();
const accountAssociationSessionMap = createAccountAssociationSessionsMap();

const oauthProviderGateway = new OAuthProviderGatewayMock();
const sessionRepository = new SessionRepositoryMock({ sessionMap });
const externalIdentityRepository = new ExternalIdentityRepositoryMock({ externalIdentityMap });
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const accountAssociationSessionRepository = new AccountAssociationSessionRepositoryMock({
	accountAssociationSessionMap,
});
const sessionSecretHasher = new SessionSecretHasherMock();
const oauthStateSigner = new OAuthStateSignerMock<typeof oauthStateSchema>();

const externalAuthLoginCallbackUseCase = new ExternalAuthLoginCallbackUseCase(
	oauthProviderGateway,
	sessionRepository,
	externalIdentityRepository,
	authUserRepository,
	accountAssociationSessionRepository,
	sessionSecretHasher,
	oauthStateSigner,
);

const { userRegistration } = createAuthUserFixture({
	userRegistration: {
		gender: newGender(DEFAULT_USER_GENDER),
	},
});

const PRODUCTION = false;

describe("ExternalAuthLoginCallbackUseCase", () => {
	beforeEach(() => {
		authUserMap.clear();
		sessionMap.clear();
		externalIdentityMap.clear();
		accountAssociationSessionMap.clear();
	});

	it("should return INVALID_STATE error for invalid state", async () => {
		const result = await externalAuthLoginCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			newExternalIdentityProvider("discord"),
			"invalid_state",
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("INVALID_STATE");
		}
	});

	it("should return INVALID_REDIRECT_URI error for invalid redirect URI", async () => {
		const signedState = oauthStateSigner.generate({ client: newClientType("web") });

		const result = await externalAuthLoginCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"https://malicious.com/redirect",
			newExternalIdentityProvider("discord"),
			signedState ?? "",
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("INVALID_REDIRECT_URI");
		}
	});

	it("should return ACCOUNT_ASSOCIATION_NOT_FOUND error when ExternalIdentity does not exist", async () => {
		const signedState = oauthStateSigner.generate({ client: "web" });

		const result = await externalAuthLoginCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			newExternalIdentityProvider("discord"),
			signedState ?? "",
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(true);
		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_ASSOCIATION_NOT_FOUND");
		}
	});

	it("should process successful login when ExternalIdentity exists", async () => {
		const externalIdentityFixture = createExternalIdentityFixture({
			externalIdentity: {
				userId: userRegistration.id,
				provider: newExternalIdentityProvider("discord"),
				providerUserId: newExternalIdentityProviderUserId("provider_user_id"),
			},
		});

		authUserMap.set(userRegistration.id, userRegistration);
		externalIdentityMap.set(
			createExternalIdentityKey(
				externalIdentityFixture.externalIdentity.provider,
				externalIdentityFixture.externalIdentity.providerUserId,
			),
			externalIdentityFixture.externalIdentity,
		);

		const signedState = oauthStateSigner.generate({ client: newClientType("web") });

		const result = await externalAuthLoginCallbackUseCase.execute(
			PRODUCTION,
			undefined,
			"/dashboard",
			newExternalIdentityProvider("discord"),
			signedState ?? "",
			"auth_code",
			"code_verifier",
		);

		expect(result.isErr).toBe(false);
		if (!result.isErr) {
			const { session, sessionToken, redirectURL, clientType } = result.value;
			expect(session.userId).toBe(userRegistration.id);
			expect(sessionToken).toBeDefined();
			expect(redirectURL).toBeInstanceOf(URL);
			expect(clientType).toBe("web");
			const savedSession = sessionMap.get(session.id);
			expect(savedSession).toBeDefined();
		}
	});
});
