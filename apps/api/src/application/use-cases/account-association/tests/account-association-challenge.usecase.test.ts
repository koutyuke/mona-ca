import { beforeEach, describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import { createAccountAssociationSessionFixture, createUserFixture } from "../../../../tests/fixtures";
import { AccountAssociationSessionRepositoryMock } from "../../../../tests/mocks/repositories/account-association-session.repository.mock";
import { createAccountAssociationSessionsMap } from "../../../../tests/mocks/repositories/table-maps";
import { AccountAssociationChallengeUseCase } from "../account-association-challenge.usecase";

const accountAssociationSessionMap = createAccountAssociationSessionsMap();

const accountAssociationSessionRepositoryMock = new AccountAssociationSessionRepositoryMock({
	accountAssociationSessionMap,
});

const accountAssociationChallengeUseCase = new AccountAssociationChallengeUseCase(
	accountAssociationSessionRepositoryMock,
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

		expect(isErr(result)).toBe(false);
		expect(result).toHaveProperty("accountAssociationSession");
		expect(result).toHaveProperty("accountAssociationSessionToken");

		if (!isErr(result)) {
			expect(result.accountAssociationSession.id).not.toBe(existingAccountAssociationSession.id);
			expect(result.accountAssociationSession.userId).toBe(user.id);
			expect(result.accountAssociationSession.email).toBe(user.email);
			expect(result.accountAssociationSession.provider).toBe(existingAccountAssociationSession.provider);
			expect(result.accountAssociationSession.providerId).toBe(existingAccountAssociationSession.providerId);
			expect(result.accountAssociationSession.code).toBeDefined();
		}
	});

	it("should delete existing account association sessions before creating new one", async () => {
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: null,
				email: user.email,
			},
		});
		accountAssociationSessionMap.set(accountAssociationSession.id, accountAssociationSession);

		const result = await accountAssociationChallengeUseCase.execute(user, accountAssociationSession);

		expect(isErr(result)).toBe(false);

		// verify existing sessions are deleted
		expect(accountAssociationSessionMap.has(accountAssociationSession.id)).toBe(false);

		// verify new session is created
		if (!isErr(result)) {
			const newSession = accountAssociationSessionMap.get(result.accountAssociationSession.id);
			expect(newSession).toBeDefined();
			expect(newSession?.userId).toBe(user.id);
		}
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

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			const code = result.accountAssociationSession.code;
			expect(code).toBeDefined();
			expect(code?.length).toBe(8);
			expect(/^\d{8}$/.test(code!)).toBe(true); // verify it's 8 digits
		}
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

		expect(isErr(result)).toBe(false);

		if (!isErr(result)) {
			expect(typeof result.accountAssociationSessionToken).toBe("string");
			expect(result.accountAssociationSessionToken.length).toBeGreaterThan(0);
			expect(result.accountAssociationSessionToken.includes(".")).toBe(true);
		}
	});
});
