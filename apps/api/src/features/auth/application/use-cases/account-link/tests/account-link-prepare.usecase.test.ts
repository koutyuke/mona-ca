import { beforeEach, describe, expect, it } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { SessionSecretHasherMock } from "../../../../../../core/testing/mocks/system";
import { AccountLinkSessionRepositoryMock, createAccountLinkSessionsMap } from "../../../../testing/mocks/repositories";
import { AccountLinkPrepareUseCase } from "../accoutn-link-prepare.usecase";

const accountLinkSessionMap = createAccountLinkSessionsMap();
const sessionSecretHasher = new SessionSecretHasherMock();

const accountLinkSessionRepository = new AccountLinkSessionRepositoryMock({ accountLinkSessionMap });
const accountLinkPrepareUseCase = new AccountLinkPrepareUseCase(accountLinkSessionRepository, sessionSecretHasher);

describe("AccountLinkPrepareUseCase", () => {
	beforeEach(() => {
		accountLinkSessionMap.clear();
	});

	it("should create a new account link session successfully", async () => {
		const userId = newUserId(ulid());

		const result = await accountLinkPrepareUseCase.execute(userId);

		expect(result.isErr).toBe(false);
		if (!result.isErr) {
			const { accountLinkSession, accountLinkSessionToken } = result.value;
			expect(accountLinkSession.id).toBeDefined();
			expect(accountLinkSession.userId).toBe(userId);
			expect(accountLinkSession.secretHash).toBeDefined();
			expect(accountLinkSession.expiresAt).toBeInstanceOf(Date);
			expect(accountLinkSessionToken).toBeDefined();
			expect(accountLinkSessionToken).toContain(".");
			expect(accountLinkSessionMap.size).toBe(1);
		}
	});

	it("should delete existing session for the same user before creating new one", async () => {
		const userId = newUserId(ulid());

		// First session creation
		await accountLinkPrepareUseCase.execute(userId);
		expect(accountLinkSessionMap.size).toBe(1);

		// Second session creation for the same user
		const result = await accountLinkPrepareUseCase.execute(userId);

		expect(result.isErr).toBe(false);
		if (!result.isErr) {
			// Should still have only one session (old one deleted)
			expect(accountLinkSessionMap.size).toBe(1);
		}
	});

	it("should create different sessions for different users", async () => {
		const userId1 = newUserId(ulid());
		const userId2 = newUserId(ulid());

		const result1 = await accountLinkPrepareUseCase.execute(userId1);
		const result2 = await accountLinkPrepareUseCase.execute(userId2);

		expect(result1.isErr).toBe(false);
		expect(result2.isErr).toBe(false);
		if (!result1.isErr && !result2.isErr) {
			expect(result1.value.accountLinkSession.id).not.toBe(result2.value.accountLinkSession.id);
			expect(result1.value.accountLinkSessionToken).not.toBe(result2.value.accountLinkSessionToken);
			expect(accountLinkSessionMap.size).toBe(2);
		}
	});

	it("should create session with valid expiration time", async () => {
		const userId = newUserId(ulid());
		const beforeExecution = Date.now();

		const result = await accountLinkPrepareUseCase.execute(userId);

		expect(result.isErr).toBe(false);
		if (!result.isErr) {
			const { accountLinkSession } = result.value;
			const expirationTime = accountLinkSession.expiresAt.getTime();
			const expectedExpiration = beforeExecution + 10 * 60 * 1000; // 10 minutes
			// Allow 1 second tolerance
			expect(expirationTime).toBeGreaterThanOrEqual(expectedExpiration - 1000);
			expect(expirationTime).toBeLessThanOrEqual(expectedExpiration + 1000);
		}
	});
});
