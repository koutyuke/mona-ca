import { assert, beforeEach, describe, expect, it } from "vitest";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import {
	createAuthUserFixture,
	createEmailVerificationRequestFixture,
	createSessionFixture,
} from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	createAuthUserMap,
	createEmailVerificationRequestMap,
	createSessionMap,
	EmailVerificationRequestRepositoryMock,
	SessionRepositoryMock,
} from "../../../../testing/mocks/repositories";
import { UpdateEmailVerifyEmailUseCase } from "../verify-email.usecase";

const authUserMap = createAuthUserMap();
const sessionMap = createSessionMap();
const emailVerificationRequestMap = createEmailVerificationRequestMap();

const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const sessionRepository = new SessionRepositoryMock({
	sessionMap,
});
const emailVerificationRequestRepository = new EmailVerificationRequestRepositoryMock({
	emailVerificationRequestMap,
});
const tokenSecretService = new TokenSecretServiceMock();

const updateEmailVerifyEmailUseCase = new UpdateEmailVerifyEmailUseCase(
	authUserRepository,
	sessionRepository,
	emailVerificationRequestRepository,
	tokenSecretService,
);

const CORRECT_CODE = "12345678";
const WRONG_CODE = "87654321";
const NEW_EMAIL = "new@example.com";
const OLD_EMAIL = "old@example.com";

const { userCredentials, userRegistration } = createAuthUserFixture({
	userRegistration: {
		email: OLD_EMAIL,
	},
});

describe("UpdateEmailVerifyEmailUseCase", () => {
	beforeEach(() => {
		authUserMap.clear();
		sessionMap.clear();
		emailVerificationRequestMap.clear();
	});

	it("Success: should change email and create new session with valid verification code", async () => {
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userCredentials.id,
				email: NEW_EMAIL,
				code: CORRECT_CODE,
			},
		});

		authUserMap.set(userRegistration.id, userRegistration);
		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		const result = await updateEmailVerifyEmailUseCase.execute(CORRECT_CODE, userCredentials, emailVerificationRequest);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { session, sessionToken } = result.value;

		// check session
		expect(session.userId).toBe(userCredentials.id);
		expect(session.secretHash).toStrictEqual(new TextEncoder().encode("__token-secret-hashed:token-secret"));

		// check session token
		// check mock fixed value: TokenSecretServiceMock returns `"token-secret"`
		expect(sessionToken).toBe(`${session.id}.token-secret`);

		// check email verification session is deleted
		expect(emailVerificationRequestMap.has(emailVerificationRequest.id)).toBe(false);

		// check user email is updated
		const updatedUserCredentials = authUserMap.get(userCredentials.id);
		expect(updatedUserCredentials).toBeDefined();
		assert(updatedUserCredentials);
		expect(updatedUserCredentials.email).toBe(NEW_EMAIL);
		expect(updatedUserCredentials.emailVerified).toBe(true);

		// check session is saved
		const savedSession = sessionMap.get(session.id);
		expect(savedSession).toStrictEqual(session);
	});

	it("Success: should delete all existing sessions and create new session when email is changed", async () => {
		const { session: existingSession1 } = createSessionFixture({
			session: {
				userId: userCredentials.id,
			},
		});
		const { session: existingSession2 } = createSessionFixture({
			session: {
				userId: userCredentials.id,
			},
		});
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userCredentials.id,
				email: NEW_EMAIL,
				code: CORRECT_CODE,
			},
		});

		authUserMap.set(userRegistration.id, userRegistration);
		sessionMap.set(existingSession1.id, existingSession1);
		sessionMap.set(existingSession2.id, existingSession2);

		const result = await updateEmailVerifyEmailUseCase.execute(CORRECT_CODE, userCredentials, emailVerificationRequest);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		// security: all existing sessions are deleted, new session is created (force re-login)
		expect(sessionMap.has(existingSession1.id)).toBe(false);
		expect(sessionMap.has(existingSession2.id)).toBe(false);
		expect(sessionMap.size).toBe(1);

		const { session } = result.value;
		const savedSession = sessionMap.get(session.id);
		expect(savedSession).toBeDefined();
	});

	it("Error: should return INVALID_CODE error when verification code is incorrect", async () => {
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userCredentials.id,
				email: NEW_EMAIL,
				code: CORRECT_CODE,
			},
		});

		authUserMap.set(userRegistration.id, userRegistration);

		const result = await updateEmailVerifyEmailUseCase.execute(WRONG_CODE, userCredentials, emailVerificationRequest);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_CODE");

		// email is not updated
		const updatedUserCredentials = authUserMap.get(userCredentials.id);
		expect(updatedUserCredentials?.email).toBe(OLD_EMAIL);
	});

	it("Error: should return INVALID_CODE error when code is empty", async () => {
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userCredentials.id,
				email: NEW_EMAIL,
				code: CORRECT_CODE,
			},
		});

		authUserMap.set(userRegistration.id, userRegistration);

		const result = await updateEmailVerifyEmailUseCase.execute("", userCredentials, emailVerificationRequest);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_CODE");
	});

	it("Error: should return EMAIL_ALREADY_REGISTERED error when new email is already taken by another user", async () => {
		const { userRegistration: anotherUserRegistration } = createAuthUserFixture({
			userRegistration: {
				email: NEW_EMAIL,
			},
		});
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userCredentials.id,
				email: NEW_EMAIL,
				code: CORRECT_CODE,
			},
		});

		authUserMap.set(userRegistration.id, userRegistration);
		authUserMap.set(anotherUserRegistration.id, anotherUserRegistration);

		const result = await updateEmailVerifyEmailUseCase.execute(CORRECT_CODE, userCredentials, emailVerificationRequest);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");

		// email is not updated
		const updatedUserCredentials = authUserMap.get(userCredentials.id);
		expect(updatedUserCredentials?.email).toBe(OLD_EMAIL);
	});

	it("Error: should return EMAIL_ALREADY_REGISTERED error when trying to change to same email", async () => {
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userCredentials.id,
				email: OLD_EMAIL,
				code: CORRECT_CODE,
			},
		});

		authUserMap.set(userRegistration.id, userRegistration);

		const result = await updateEmailVerifyEmailUseCase.execute(CORRECT_CODE, userCredentials, emailVerificationRequest);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");

		// email is not updated
		const updatedUserCredentials = authUserMap.get(userCredentials.id);
		expect(updatedUserCredentials?.email).toBe(OLD_EMAIL);
	});
});
