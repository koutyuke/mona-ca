import { afterEach, assert, beforeEach, describe, expect, it } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { newIdentityProviders } from "../../../../domain/value-objects/identity-providers";
import { encodeToken, newProviderLinkRequestToken } from "../../../../domain/value-objects/tokens";
import { createAuthUserFixture, createProviderLinkRequestFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	createAuthUserMap,
	createProviderLinkRequestMap,
	createSessionMap,
	ProviderLinkRequestRepositoryMock,
} from "../../../../testing/mocks/repositories";
import { ProviderLinkValidateRequestUseCase } from "../validate-request.usecase";

const authUserMap = createAuthUserMap();
const sessionMap = createSessionMap();
const providerLinkRequestMap = createProviderLinkRequestMap();

const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const providerLinkRequestRepository = new ProviderLinkRequestRepositoryMock({
	providerLinkRequestMap,
});
const tokenSecretService = new TokenSecretServiceMock();

const providerLinkValidateRequestUseCase = new ProviderLinkValidateRequestUseCase(
	authUserRepository,
	providerLinkRequestRepository,
	tokenSecretService,
);

const { userCredentials, userRegistration } = createAuthUserFixture();

const PROVIDER = newIdentityProviders("discord");

describe("ProviderLinkValidateRequestUseCase", () => {
	beforeEach(() => {
		authUserMap.set(userRegistration.id, userRegistration);
	});

	afterEach(() => {
		authUserMap.clear();
		sessionMap.clear();
		providerLinkRequestMap.clear();
	});

	it("Success: should return user credentials when valid request token is provided", async () => {
		const { providerLinkRequest, providerLinkRequestToken } = createProviderLinkRequestFixture({
			providerLinkRequest: {
				userId: userRegistration.id,
				provider: PROVIDER,
			},
		});
		providerLinkRequestMap.set(providerLinkRequest.id, providerLinkRequest);

		const result = await providerLinkValidateRequestUseCase.execute(PROVIDER, providerLinkRequestToken);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		expect(result.value.userCredentials).toStrictEqual(userCredentials);

		// check request is one time use
		expect(providerLinkRequestMap.has(providerLinkRequest.id)).toBe(false);
	});

	it("Error(token format): should return INVALID_PROVIDER_LINK_REQUEST when token format is invalid", async () => {
		const invalidToken = newProviderLinkRequestToken("invalid_token_format");

		const result = await providerLinkValidateRequestUseCase.execute(PROVIDER, invalidToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_PROVIDER_LINK_REQUEST");
	});

	it("Error(not found): should return INVALID_PROVIDER_LINK_REQUEST when corresponding request does not exist", async () => {
		const { providerLinkRequestToken } = createProviderLinkRequestFixture({
			providerLinkRequest: {
				userId: userRegistration.id,
			},
		});

		const result = await providerLinkValidateRequestUseCase.execute(PROVIDER, providerLinkRequestToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_PROVIDER_LINK_REQUEST");
	});

	it("Error(secret mismatch): should return INVALID_PROVIDER_LINK_REQUEST and delete request when secret mismatch", async () => {
		const { providerLinkRequest, providerLinkRequestSecret } = createProviderLinkRequestFixture({
			providerLinkRequest: {
				userId: userRegistration.id,
			},
		});
		providerLinkRequestMap.set(providerLinkRequest.id, providerLinkRequest);

		const wrongSecret = `${providerLinkRequestSecret}-tampered`;
		const tamperedToken = encodeToken(providerLinkRequest.id, wrongSecret);

		const result = await providerLinkValidateRequestUseCase.execute(PROVIDER, tamperedToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_PROVIDER_LINK_REQUEST");
		expect(providerLinkRequestMap.has(providerLinkRequest.id)).toBe(false);
	});

	it("Error(expired): should return INVALID_PROVIDER_LINK_REQUEST and delete request when expired", async () => {
		const { providerLinkRequest, providerLinkRequestToken } = createProviderLinkRequestFixture({
			providerLinkRequest: {
				userId: userRegistration.id,
				provider: PROVIDER,
				expiresAt: new Date(0),
			},
		});
		providerLinkRequestMap.set(providerLinkRequest.id, providerLinkRequest);

		const result = await providerLinkValidateRequestUseCase.execute(PROVIDER, providerLinkRequestToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_PROVIDER_LINK_REQUEST");
		expect(providerLinkRequestMap.has(providerLinkRequest.id)).toBe(false);
	});

	it("Error(user missing): should return INVALID_PROVIDER_LINK_REQUEST and delete request when user does not exist", async () => {
		const anotherUserId = newUserId(ulid());
		const { providerLinkRequest, providerLinkRequestToken } = createProviderLinkRequestFixture({
			providerLinkRequest: {
				userId: anotherUserId,
				provider: PROVIDER,
			},
		});

		providerLinkRequestMap.set(providerLinkRequest.id, providerLinkRequest);

		const result = await providerLinkValidateRequestUseCase.execute(PROVIDER, providerLinkRequestToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_PROVIDER_LINK_REQUEST");
		expect(providerLinkRequestMap.has(providerLinkRequest.id)).toBe(false);
	});

	it("Error(provider mismatch): should return INVALID_PROVIDER_LINK_REQUEST and delete request when provider mismatch", async () => {
		const { providerLinkRequest, providerLinkRequestToken } = createProviderLinkRequestFixture({
			providerLinkRequest: {
				userId: userRegistration.id,
				provider: PROVIDER,
			},
		});

		const anotherProvider = newIdentityProviders("google");
		providerLinkRequestMap.set(providerLinkRequest.id, providerLinkRequest);

		const result = await providerLinkValidateRequestUseCase.execute(anotherProvider, providerLinkRequestToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_PROVIDER_LINK_REQUEST");
		expect(providerLinkRequestMap.has(providerLinkRequest.id)).toBe(false);
	});
});
