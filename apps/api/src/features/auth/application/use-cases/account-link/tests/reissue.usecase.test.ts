import { assert, beforeEach, describe, expect, it } from "vitest";
import { ulid } from "../../../../../../core/lib/id";
import { EmailGatewayMock } from "../../../../../../core/testing/mocks/gateways";
import { CryptoRandomServiceMock, TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { newIdentityProviders, newIdentityProvidersUserId } from "../../../../domain/value-objects/identity-providers";
import { createAccountLinkRequestFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import { AccountLinkRequestRepositoryMock, createAccountLinkRequestMap } from "../../../../testing/mocks/repositories";
import { AccountLinkReissueUseCase } from "../reissue.usecase";

const accountLinkRequestMap = createAccountLinkRequestMap();

const accountLinkRequestRepository = new AccountLinkRequestRepositoryMock({
	accountLinkRequestMap,
});

const tokenSecretService = new TokenSecretServiceMock();
const cryptoRandomService = new CryptoRandomServiceMock();
const emailGateway = new EmailGatewayMock();

const accountLinkRequestReissueUseCase = new AccountLinkReissueUseCase(
	emailGateway,
	accountLinkRequestRepository,
	cryptoRandomService,
	tokenSecretService,
);

const { userRegistration } = createAuthUserFixture();

describe("AccountLinkReissueUseCase", () => {
	beforeEach(() => {
		accountLinkRequestMap.clear();
		emailGateway.sendVerificationEmailCalls = [];
	});

	it("should reissue account link request successfully", async () => {
		const { accountLinkRequest: existingAccountLinkRequest } = createAccountLinkRequestFixture({
			accountLinkRequest: {
				userId: userRegistration.id,
				code: null,
				email: userRegistration.email,
				provider: newIdentityProviders("discord"),
				providerUserId: newIdentityProvidersUserId(ulid()),
			},
		});

		accountLinkRequestMap.set(existingAccountLinkRequest.id, existingAccountLinkRequest);

		const result = await accountLinkRequestReissueUseCase.execute(existingAccountLinkRequest);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { accountLinkRequest, accountLinkRequestToken } = result.value;

		// check new account link request
		expect(accountLinkRequest.id).not.toBe(existingAccountLinkRequest.id);
		expect(accountLinkRequest.userId).toBe(userRegistration.id);
		expect(accountLinkRequest.email).toBe(userRegistration.email);
		expect(accountLinkRequest.provider).toBe(existingAccountLinkRequest.provider);
		expect(accountLinkRequest.providerUserId).toBe(existingAccountLinkRequest.providerUserId);
		expect(accountLinkRequest.code).toBe("01234567");
		expect(accountLinkRequest.secretHash).toStrictEqual(new TextEncoder().encode("__token-secret-hashed:token-secret"));

		// check new account link request token
		expect(accountLinkRequestToken).toBe(`${accountLinkRequest.id}.token-secret`);

		// check new account link request is saved
		const savedAccountLinkRequest = accountLinkRequestMap.get(accountLinkRequest.id);
		expect(savedAccountLinkRequest).toStrictEqual(accountLinkRequest);

		// check old account link request is deleted
		expect(accountLinkRequestMap.has(existingAccountLinkRequest.id)).toBe(false);

		// check email was sent
		expect(emailGateway.sendVerificationEmailCalls.length).toBe(1);
		expect(emailGateway.sendVerificationEmailCalls[0]?.email).toBe(userRegistration.email);
		expect(emailGateway.sendVerificationEmailCalls[0]?.code).toBe("01234567");
	});
});
