import { assert, beforeEach, describe, expect, it } from "vitest";
import { EmailGatewayMock } from "../../../../../../core/testing/mocks/gateways";
import { CryptoRandomServiceMock, TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { createAccountLinkSessionFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import { AccountLinkSessionRepositoryMock, createAccountLinkSessionsMap } from "../../../../testing/mocks/repositories";
import { AccountLinkReissueSessionUseCase } from "../reissue-session.usecase";

const accountLinkSessionMap = createAccountLinkSessionsMap();

const accountLinkSessionRepository = new AccountLinkSessionRepositoryMock({
	accountLinkSessionMap,
});

const tokenSecretService = new TokenSecretServiceMock();
const cryptoRandomService = new CryptoRandomServiceMock();
const emailGateway = new EmailGatewayMock();

const accountLinkReissueSessionUseCase = new AccountLinkReissueSessionUseCase(
	emailGateway,
	accountLinkSessionRepository,
	cryptoRandomService,
	tokenSecretService,
);

const { userRegistration } = createAuthUserFixture();

describe("AccountLinkReissueSessionUseCase", () => {
	beforeEach(() => {
		accountLinkSessionMap.clear();
		emailGateway.sendVerificationEmailCalls = [];
	});

	it("should reissue account link session successfully", async () => {
		const { accountLinkSession: existingAccountLinkSession } = createAccountLinkSessionFixture({
			accountLinkSession: {
				userId: userRegistration.id,
				code: null,
				email: userRegistration.email,
			},
		});

		accountLinkSessionMap.set(existingAccountLinkSession.id, existingAccountLinkSession);

		const result = await accountLinkReissueSessionUseCase.execute(existingAccountLinkSession);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { accountLinkSession, accountLinkSessionToken } = result.value;

		// check new session
		expect(accountLinkSession.id).not.toBe(existingAccountLinkSession.id);
		expect(accountLinkSession.userId).toBe(userRegistration.id);
		expect(accountLinkSession.email).toBe(userRegistration.email);
		expect(accountLinkSession.provider).toBe(existingAccountLinkSession.provider);
		expect(accountLinkSession.providerUserId).toBe(existingAccountLinkSession.providerUserId);
		expect(accountLinkSession.code).toBe("01234567");
		expect(accountLinkSession.secretHash).toStrictEqual(new TextEncoder().encode("__token-secret-hashed:token-secret"));

		// check new session token
		expect(accountLinkSessionToken).toBe(`${accountLinkSession.id}.token-secret`);

		// check new session is saved
		const savedSession = accountLinkSessionMap.get(accountLinkSession.id);
		expect(savedSession).toStrictEqual(accountLinkSession);

		// check old session is deleted
		expect(accountLinkSessionMap.has(existingAccountLinkSession.id)).toBe(false);

		// check email was sent
		expect(emailGateway.sendVerificationEmailCalls.length).toBe(1);
		expect(emailGateway.sendVerificationEmailCalls[0]?.email).toBe(userRegistration.email);
		expect(emailGateway.sendVerificationEmailCalls[0]?.code).toBe("01234567");
	});
});
