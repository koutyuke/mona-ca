import { assert, beforeEach, describe, expect, it } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { encodeToken, newAccountLinkRequestToken } from "../../../../domain/value-objects/tokens";
import { createAccountLinkRequestFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import {
	AccountLinkRequestRepositoryMock,
	AuthUserRepositoryMock,
	createAccountLinkRequestMap,
	createAuthUserMap,
	createSessionMap,
} from "../../../../testing/mocks/repositories";
import { AccountLinkValidateRequestUseCase } from "../validate-request.usecase";

const authUserMap = createAuthUserMap();
const sessionMap = createSessionMap();
const accountLinkRequestMap = createAccountLinkRequestMap();

const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const accountLinkRequestRepository = new AccountLinkRequestRepositoryMock({
	accountLinkRequestMap,
});
const tokenSecretService = new TokenSecretServiceMock();

const accountLinkValidateRequestUseCase = new AccountLinkValidateRequestUseCase(
	authUserRepository,
	accountLinkRequestRepository,
	tokenSecretService,
);

const { userRegistration, userCredentials } = createAuthUserFixture();

describe("AccountLinkValidateRequestUseCase", () => {
	beforeEach(() => {
		authUserMap.clear();
		accountLinkRequestMap.clear();
		sessionMap.clear();

		authUserMap.set(userRegistration.id, userRegistration);
	});

	it("should validate account link request successfully with valid token", async () => {
		// create provider link proposal
		const { accountLinkRequest, accountLinkRequestToken } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});
		accountLinkRequestMap.set(accountLinkRequest.id, accountLinkRequest);

		const result = await accountLinkValidateRequestUseCase.execute(accountLinkRequestToken);

		expect(result.isErr).toBe(false);

		assert(result.isOk);

		const { accountLinkRequest: validatedAccountLinkRequest, userCredentials: validatedUserCredentials } = result.value;

		// should return expected user credentials and provider link proposal
		expect(validatedUserCredentials).toStrictEqual(userCredentials);
		expect(validatedAccountLinkRequest).toStrictEqual(accountLinkRequest);

		// should saved account link request
		const savedAccountLinkRequest = accountLinkRequestMap.get(accountLinkRequest.id);
		expect(savedAccountLinkRequest).toStrictEqual(accountLinkRequest);
	});

	it("should return INVALID_ACCOUNT_LINK_REQUEST error for invalid token format", async () => {
		const invalidToken = newAccountLinkRequestToken("invalid_token_format");

		const result = await accountLinkValidateRequestUseCase.execute(invalidToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("INVALID_ACCOUNT_LINK_REQUEST");
	});

	it("should return INVALID_ACCOUNT_LINK_REQUEST error for non-existent account link request", async () => {
		const { accountLinkRequestToken } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});

		const result = await accountLinkValidateRequestUseCase.execute(accountLinkRequestToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("INVALID_ACCOUNT_LINK_REQUEST");
	});

	it("should return INVALID_ACCOUNT_LINK_REQUEST error for expired account link request", async () => {
		// create account link request that is expired
		const { accountLinkRequest, accountLinkRequestToken } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
				expiresAt: new Date(0),
			},
		});

		// save proposal
		accountLinkRequestMap.set(accountLinkRequest.id, accountLinkRequest);

		const result = await accountLinkValidateRequestUseCase.execute(accountLinkRequestToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("INVALID_ACCOUNT_LINK_REQUEST");

		// verify proposal is deleted
		expect(accountLinkRequestMap.has(accountLinkRequest.id)).toBe(false);
	});

	it("should return INVALID_ACCOUNT_LINK_REQUEST error for invalid account link request secret", async () => {
		// create provider link proposal
		const { accountLinkRequest } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});
		accountLinkRequestMap.set(accountLinkRequest.id, accountLinkRequest);

		// create token with different secret
		const wrongSecret = "wrongSecret";
		const invalidAccountLinkRequestToken = encodeToken(accountLinkRequest.id, wrongSecret);

		const result = await accountLinkValidateRequestUseCase.execute(invalidAccountLinkRequestToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("INVALID_ACCOUNT_LINK_REQUEST");
	});

	it("should return INVALID_ACCOUNT_LINK_REQUEST error when user does not exist", async () => {
		// create provider link proposal
		const differentUserId = newUserId(ulid());
		const { accountLinkRequest, accountLinkRequestToken } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: differentUserId,
				code: "12345678",
				email: userRegistration.email,
			},
		});

		// save proposal but not user
		accountLinkRequestMap.set(accountLinkRequest.id, accountLinkRequest);

		const result = await accountLinkValidateRequestUseCase.execute(accountLinkRequestToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("INVALID_ACCOUNT_LINK_REQUEST");

		// verify proposal is deleted
		expect(accountLinkRequestMap.has(accountLinkRequest.id)).toBe(false);
	});

	it("should return INVALID_ACCOUNT_LINK_REQUEST error when user email does not match", async () => {
		// create provider link proposal with different email
		const differentEmail = "different@example.com";
		const { accountLinkRequest, accountLinkRequestToken } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: userRegistration.id,
				code: "12345678",
				email: differentEmail,
			},
		});

		// save user and proposal
		accountLinkRequestMap.set(accountLinkRequest.id, accountLinkRequest);

		const result = await accountLinkValidateRequestUseCase.execute(accountLinkRequestToken);

		expect(result.isErr).toBe(true);

		assert(result.isErr);
		expect(result.code).toBe("INVALID_ACCOUNT_LINK_REQUEST");

		// verify proposal is deleted
		expect(accountLinkRequestMap.has(accountLinkRequest.id)).toBe(false);
	});
});
