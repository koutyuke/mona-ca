import { beforeEach, describe, expect, it } from "vitest";
import { EmailGatewayMock } from "../../../../../../core/testing/mocks/gateways";
import { RandomGeneratorMock, SessionSecretHasherMock } from "../../../../../../core/testing/mocks/system";
import { createAccountAssociationSessionFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import {
	AccountAssociationSessionRepositoryMock,
	createAccountAssociationSessionsMap,
} from "../../../../testing/mocks/repositories";
import { AccountAssociationChallengeUseCase } from "../account-association-challenge.usecase";

const accountAssociationSessionMap = createAccountAssociationSessionsMap();

const accountAssociationSessionRepository = new AccountAssociationSessionRepositoryMock({
	accountAssociationSessionMap,
});

const sessionSecretHasher = new SessionSecretHasherMock();
const randomGenerator = new RandomGeneratorMock();
const emailGateway = new EmailGatewayMock();

const accountAssociationChallengeUseCase = new AccountAssociationChallengeUseCase(
	accountAssociationSessionRepository,
	sessionSecretHasher,
	randomGenerator,
	emailGateway,
);

const { userRegistration } = createAuthUserFixture();

describe("AccountAssociationChallengeUseCase", () => {
	beforeEach(() => {
		accountAssociationSessionMap.clear();
	});

	it("should create account association challenge successfully", async () => {
		const { accountAssociationSession: existingAccountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: userRegistration.id,
				code: null,
				email: userRegistration.email,
			},
		});

		accountAssociationSessionMap.set(existingAccountAssociationSession.id, existingAccountAssociationSession);

		const result = await accountAssociationChallengeUseCase.execute(existingAccountAssociationSession);

		const { accountAssociationSession } = result.value;
		expect(accountAssociationSession.id).not.toBe(existingAccountAssociationSession.id);
		expect(accountAssociationSession.userId).toBe(userRegistration.id);
		expect(accountAssociationSession.email).toBe(userRegistration.email);
		expect(accountAssociationSession.provider).toBe(existingAccountAssociationSession.provider);
		expect(accountAssociationSession.providerUserId).toBe(existingAccountAssociationSession.providerUserId);
		expect(accountAssociationSession.code).toBeDefined();
	});

	it("should delete existing account association sessions before creating new one", async () => {
		const { accountAssociationSession: existingAccountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: userRegistration.id,
				code: null,
				email: userRegistration.email,
			},
		});
		accountAssociationSessionMap.set(existingAccountAssociationSession.id, existingAccountAssociationSession);

		const result = await accountAssociationChallengeUseCase.execute(existingAccountAssociationSession);

		// verify existing sessions are deleted
		expect(accountAssociationSessionMap.has(existingAccountAssociationSession.id)).toBe(false);

		// verify new session is created
		const { accountAssociationSession } = result.value;
		const newSession = accountAssociationSessionMap.get(accountAssociationSession.id);
		expect(newSession).toBeDefined();
		expect(newSession?.userId).toBe(userRegistration.id);
	});

	it("should generate 8-digit numeric verification code", async () => {
		// create account association session
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: userRegistration.id,
				code: null,
				email: userRegistration.email,
			},
		});

		const result = await accountAssociationChallengeUseCase.execute(accountAssociationSession);

		const code = result.value.accountAssociationSession.code;
		expect(code).toBe("01234567");
	});

	it("should create session token with correct format", async () => {
		// create account association session
		const { accountAssociationSession: existingAccountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: userRegistration.id,
				code: null,
				email: userRegistration.email,
			},
		});

		const result = await accountAssociationChallengeUseCase.execute(existingAccountAssociationSession);

		const { accountAssociationSessionToken } = result.value;
		expect(typeof accountAssociationSessionToken).toBe("string");
		expect(accountAssociationSessionToken.length).toBeGreaterThan(0);
		expect(accountAssociationSessionToken.includes(".")).toBe(true);
	});
});
