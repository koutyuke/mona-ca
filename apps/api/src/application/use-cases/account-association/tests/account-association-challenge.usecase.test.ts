import { beforeEach, describe, expect, it } from "vitest";
import { createAccountAssociationSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import {
	AccountAssociationSessionRepositoryMock,
	RandomGeneratorMock,
	SessionSecretHasherMock,
} from "../../../../tests/mocks";
import { createAccountAssociationSessionsMap } from "../../../../tests/mocks/repositories/table-maps";
import { AccountAssociationChallengeUseCase } from "../account-association-challenge.usecase";

const accountAssociationSessionMap = createAccountAssociationSessionsMap();

const accountAssociationSessionRepository = new AccountAssociationSessionRepositoryMock({
	accountAssociationSessionMap,
});

const sessionSecretHasher = new SessionSecretHasherMock();
const randomGenerator = new RandomGeneratorMock();

const accountAssociationChallengeUseCase = new AccountAssociationChallengeUseCase(
	accountAssociationSessionRepository,
	sessionSecretHasher,
	randomGenerator,
);

const { user } = createUserFixture();

describe("AccountAssociationChallengeUseCase", () => {
	beforeEach(() => {
		accountAssociationSessionMap.clear();
	});

	it("should create account association challenge successfully", async () => {
		const { accountAssociationSession: existingAccountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: null,
				email: user.email,
			},
		});

		accountAssociationSessionMap.set(existingAccountAssociationSession.id, existingAccountAssociationSession);

		const result = await accountAssociationChallengeUseCase.execute(user, existingAccountAssociationSession);

		const { accountAssociationSession } = result;
		expect(accountAssociationSession.id).not.toBe(existingAccountAssociationSession.id);
		expect(accountAssociationSession.userId).toBe(user.id);
		expect(accountAssociationSession.email).toBe(user.email);
		expect(accountAssociationSession.provider).toBe(existingAccountAssociationSession.provider);
		expect(accountAssociationSession.providerUserId).toBe(existingAccountAssociationSession.providerUserId);
		expect(accountAssociationSession.code).toBeDefined();
	});

	it("should delete existing account association sessions before creating new one", async () => {
		const { accountAssociationSession: existingAccountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: null,
				email: user.email,
			},
		});
		accountAssociationSessionMap.set(existingAccountAssociationSession.id, existingAccountAssociationSession);

		const result = await accountAssociationChallengeUseCase.execute(user, existingAccountAssociationSession);

		// verify existing sessions are deleted
		expect(accountAssociationSessionMap.has(existingAccountAssociationSession.id)).toBe(false);

		// verify new session is created
		const { accountAssociationSession } = result;
		const newSession = accountAssociationSessionMap.get(accountAssociationSession.id);
		expect(newSession).toBeDefined();
		expect(newSession?.userId).toBe(user.id);
	});

	it("should generate 8-digit numeric verification code", async () => {
		// create account association session
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: null,
				email: user.email,
			},
		});

		const result = await accountAssociationChallengeUseCase.execute(user, accountAssociationSession);

		const code = result.accountAssociationSession.code;
		expect(code).toBe("01234567");
	});

	it("should create session token with correct format", async () => {
		// create account association session
		const { accountAssociationSession: existingAccountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: null,
				email: user.email,
			},
		});

		const result = await accountAssociationChallengeUseCase.execute(user, existingAccountAssociationSession);

		const { accountAssociationSessionToken } = result;
		expect(typeof accountAssociationSessionToken).toBe("string");
		expect(accountAssociationSessionToken.length).toBeGreaterThan(0);
		expect(accountAssociationSessionToken.includes(".")).toBe(true);
	});
});
