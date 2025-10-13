import { beforeEach, describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import { DEFAULT_USER_GENDER } from "../../../../domain/entities";
import {
	newClientType,
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
	newGender,
} from "../../../../domain/value-object";
import { createExternalIdentityFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	AccountAssociationSessionRepositoryMock,
	ExternalIdentityRepositoryMock,
	OAuthProviderGatewayMock,
	OAuthStateSignerMock,
	SessionRepositoryMock,
	SessionSecretHasherMock,
	UserRepositoryMock,
	createAccountAssociationSessionsMap,
	createExternalIdentitiesMap,
	createExternalIdentityKey,
	createSessionsMap,
	createUserPasswordHashMap,
	createUsersMap,
} from "../../../../tests/mocks";
import { ExternalAuthLoginCallbackUseCase } from "../external-auth-login-callback.usecase";
import type { oauthStateSchema } from "../schema";

const userMap = createUsersMap();
const sessionMap = createSessionsMap();
const userPasswordHashMap = createUserPasswordHashMap();
const externalIdentityMap = createExternalIdentitiesMap();
const accountAssociationSessionMap = createAccountAssociationSessionsMap();

const oauthProviderGateway = new OAuthProviderGatewayMock();
const sessionRepository = new SessionRepositoryMock({ sessionMap });
const externalIdentityRepository = new ExternalIdentityRepositoryMock({ externalIdentityMap });
const userRepository = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
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
	userRepository,
	accountAssociationSessionRepository,
	sessionSecretHasher,
	oauthStateSigner,
);

const { user } = createUserFixture({
	user: {
		gender: newGender(DEFAULT_USER_GENDER),
	},
});

const PRODUCTION = false;

describe("ExternalAuthLoginCallbackUseCase", () => {
	beforeEach(() => {
		userMap.clear();
		sessionMap.clear();
		userPasswordHashMap.clear();
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

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
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

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("INVALID_REDIRECT_URI");
		}
	});

	it("should return EXTERNAL_IDENTITY_NOT_FOUND error when ExternalIdentity does not exist", async () => {
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

		expect(isErr(result)).toBe(true);
		if (isErr(result)) {
			expect(result.code).toBe("EXTERNAL_IDENTITY_NOT_FOUND");
		}
	});

	it("should process successful login when ExternalIdentity exists", async () => {
		const externalIdentityFixture = createExternalIdentityFixture({
			externalIdentity: {
				userId: user.id,
				provider: newExternalIdentityProvider("discord"),
				providerUserId: newExternalIdentityProviderUserId("provider_user_id"),
			},
		});

		userMap.set(user.id, user);
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
