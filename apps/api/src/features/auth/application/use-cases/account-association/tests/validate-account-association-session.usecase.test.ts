import { beforeEach, describe, expect, it } from "vitest";
import {
	formatSessionToken,
	newAccountAssociationSessionToken,
	newUserId,
} from "../../../../../../common/domain/value-objects";
import { ulid } from "../../../../../../lib/utils";
import { createAccountAssociationSessionFixture, createUserFixture } from "../../../../../../tests/fixtures";
import { SessionSecretHasherMock } from "../../../../../../tests/mocks";
import { AccountAssociationSessionRepositoryMock } from "../../../../../../tests/mocks/repositories/account-association-session.repository.mock";
import {
	createAccountAssociationSessionsMap,
	createSessionsMap,
	createUsersMap,
} from "../../../../../../tests/mocks/repositories/table-maps";
import { UserRepositoryMock } from "../../../../../../tests/mocks/repositories/user.repository.mock";
import { ValidateAccountAssociationSessionUseCase } from "../validate-account-association-session.usecase";

const userMap = createUsersMap();
const userPasswordHashMap = new Map();
const sessionMap = createSessionsMap();
const accountAssociationSessionMap = createAccountAssociationSessionsMap();

const userRepository = new UserRepositoryMock({
	userMap,
	userPasswordHashMap,
	sessionMap,
});
const accountAssociationSessionRepository = new AccountAssociationSessionRepositoryMock({
	accountAssociationSessionMap,
});
const sessionSecretHasher = new SessionSecretHasherMock();

const validateAccountAssociationSessionUseCase = new ValidateAccountAssociationSessionUseCase(
	userRepository,
	accountAssociationSessionRepository,
	sessionSecretHasher,
);

const { user } = createUserFixture();

describe("ValidateAccountAssociationSessionUseCase", () => {
	beforeEach(() => {
		userMap.clear();
		accountAssociationSessionMap.clear();
		userPasswordHashMap.clear();
		sessionMap.clear();

		userMap.set(user.id, user);
	});

	it("should validate account association session successfully with valid token", async () => {
		// create account association session
		const { accountAssociationSession, accountAssociationSessionToken } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: "12345678",
				email: user.email,
			},
		});

		accountAssociationSessionMap.set(accountAssociationSession.id, accountAssociationSession);

		const result = await validateAccountAssociationSessionUseCase.execute(accountAssociationSessionToken);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { accountAssociationSession, user } = result.value;
			expect(accountAssociationSession.id).toBe(accountAssociationSession.id);
			expect(accountAssociationSession.userId).toBe(user.id);
			expect(user.id).toBe(user.id);
		}
	});

	it("should return ACCOUNT_ASSOCIATION_SESSION_INVALID error for invalid token format", async () => {
		const invalidToken = newAccountAssociationSessionToken("invalid_token_format");

		const result = await validateAccountAssociationSessionUseCase.execute(invalidToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}
	});

	it("should return ACCOUNT_ASSOCIATION_SESSION_INVALID error for non-existent session", async () => {
		const { accountAssociationSessionToken } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: "12345678",
				email: user.email,
			},
		});

		const result = await validateAccountAssociationSessionUseCase.execute(accountAssociationSessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}
	});

	it("should return ACCOUNT_ASSOCIATION_SESSION_EXPIRED error for expired session", async () => {
		// create account association session that is expired
		const { accountAssociationSession, accountAssociationSessionToken } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: "12345678",
				email: user.email,
				expiresAt: new Date(0),
			},
		});

		// save session
		accountAssociationSessionMap.set(accountAssociationSession.id, accountAssociationSession);

		const result = await validateAccountAssociationSessionUseCase.execute(accountAssociationSessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_ASSOCIATION_SESSION_EXPIRED");
		}

		// verify session is deleted
		expect(accountAssociationSessionMap.has(accountAssociationSession.id)).toBe(false);
	});

	it("should return ACCOUNT_ASSOCIATION_SESSION_INVALID error for invalid session secret", async () => {
		// create account association session
		const { accountAssociationSession } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: "12345678",
				email: user.email,
			},
		});

		// create token with different secret
		const wrongSecret = "wrongSecret";
		const invalidSessionToken = formatSessionToken(accountAssociationSession.id, wrongSecret);

		// save session
		accountAssociationSessionMap.set(accountAssociationSession.id, accountAssociationSession);

		const result = await validateAccountAssociationSessionUseCase.execute(invalidSessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}
	});

	it("should return ACCOUNT_ASSOCIATION_SESSION_INVALID error when user does not exist", async () => {
		// create account association session
		const differentUserId = newUserId(ulid());
		const { accountAssociationSession, accountAssociationSessionToken } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: differentUserId,
				code: "12345678",
				email: user.email,
			},
		});

		// save session but not user
		accountAssociationSessionMap.set(accountAssociationSession.id, accountAssociationSession);

		const result = await validateAccountAssociationSessionUseCase.execute(accountAssociationSessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}

		// verify session is deleted
		expect(accountAssociationSessionMap.has(accountAssociationSession.id)).toBe(false);
	});

	it("should return ACCOUNT_ASSOCIATION_SESSION_INVALID error when user email does not match", async () => {
		// create account association session with different email
		const differentEmail = "different@example.com";
		const { accountAssociationSession, accountAssociationSessionToken } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: user.id,
				code: "12345678",
				email: differentEmail,
			},
		});

		// save user and session
		accountAssociationSessionMap.set(accountAssociationSession.id, accountAssociationSession);

		const result = await validateAccountAssociationSessionUseCase.execute(accountAssociationSessionToken);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("ACCOUNT_ASSOCIATION_SESSION_INVALID");
		}

		// verify session is deleted
		expect(accountAssociationSessionMap.has(accountAssociationSession.id)).toBe(false);
	});
});
