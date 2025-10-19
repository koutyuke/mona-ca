import { beforeEach, describe, expect, it } from "vitest";
import { newUserId } from "../../../../../../shared/domain/value-objects";
import { ulid } from "../../../../../../shared/lib/id";
import { SessionSecretHasherMock } from "../../../../../../shared/testing/mocks/system";
import {
	formatAnySessionToken,
	newAccountAssociationSessionToken,
} from "../../../../domain/value-objects/session-token";
import { createAccountAssociationSessionFixture, createAuthUserFixture } from "../../../../testing/fixtures";
import {
	AccountAssociationSessionRepositoryMock,
	AuthUserRepositoryMock,
	createAccountAssociationSessionsMap,
	createAuthUserMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { ValidateAccountAssociationSessionUseCase } from "../validate-account-association-session.usecase";

const authUserMap = createAuthUserMap();
const sessionMap = createSessionsMap();
const accountAssociationSessionMap = createAccountAssociationSessionsMap();

const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const accountAssociationSessionRepository = new AccountAssociationSessionRepositoryMock({
	accountAssociationSessionMap,
});
const sessionSecretHasher = new SessionSecretHasherMock();

const validateAccountAssociationSessionUseCase = new ValidateAccountAssociationSessionUseCase(
	authUserRepository,
	accountAssociationSessionRepository,
	sessionSecretHasher,
);

const { userRegistration } = createAuthUserFixture();

describe("ValidateAccountAssociationSessionUseCase", () => {
	beforeEach(() => {
		authUserMap.clear();
		accountAssociationSessionMap.clear();
		sessionMap.clear();

		authUserMap.set(userRegistration.id, userRegistration);
	});

	it("should validate account association session successfully with valid token", async () => {
		// create account association session
		const { accountAssociationSession, accountAssociationSessionToken } = createAccountAssociationSessionFixture({
			accountAssociationSession: {
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});

		accountAssociationSessionMap.set(accountAssociationSession.id, accountAssociationSession);

		const result = await validateAccountAssociationSessionUseCase.execute(accountAssociationSessionToken);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { accountAssociationSession: validatedSession, userIdentity } = result.value;
			expect(validatedSession.id).toBe(accountAssociationSession.id);
			expect(validatedSession.userId).toBe(userIdentity.id);
			expect(userIdentity.id).toBe(userRegistration.id);
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
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
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
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
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
				userId: userRegistration.id,
				code: "12345678",
				email: userRegistration.email,
			},
		});

		// create token with different secret
		const wrongSecret = "wrongSecret";
		const invalidSessionToken = formatAnySessionToken(accountAssociationSession.id, wrongSecret);

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
				email: userRegistration.email,
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
				userId: userRegistration.id,
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
