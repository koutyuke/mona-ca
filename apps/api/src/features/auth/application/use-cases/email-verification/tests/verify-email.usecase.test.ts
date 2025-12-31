import { assert, beforeEach, describe, expect, it } from "vitest";
import { createAuthUserFixture, createEmailVerificationRequestFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	createAuthUserMap,
	createEmailVerificationRequestMap,
	createSessionMap,
	EmailVerificationRequestRepositoryMock,
} from "../../../../testing/mocks/repositories";
import { EmailVerificationVerifyEmailUseCase } from "../verify-email.usecase";

const authUserMap = createAuthUserMap();
const sessionMap = createSessionMap();
const emailVerificationRequestMap = createEmailVerificationRequestMap();

const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const emailVerificationRequestRepository = new EmailVerificationRequestRepositoryMock({
	emailVerificationRequestMap,
});

const emailVerificationVerifyEmailUseCase = new EmailVerificationVerifyEmailUseCase(
	authUserRepository,
	emailVerificationRequestRepository,
);

const TEST_EMAIL = "test@example.com";
const TEST_NAME = "test_user";
const CORRECT_CODE = "12345678";
const WRONG_CODE = "87654321";

const { userRegistration, userCredentials } = createAuthUserFixture({
	userRegistration: {
		email: TEST_EMAIL,
		name: TEST_NAME,
		emailVerified: false,
	},
});

describe("EmailVerificationVerifyEmailUseCase", () => {
	beforeEach(() => {
		authUserMap.clear();
		sessionMap.clear();
		emailVerificationRequestMap.clear();

		authUserMap.set(userRegistration.id, { ...userRegistration });
	});

	it("Success: should complete email verification with correct code", async () => {
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: CORRECT_CODE,
			},
		});
		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		const result = await emailVerificationVerifyEmailUseCase.execute(
			CORRECT_CODE,
			userCredentials,
			emailVerificationRequest,
		);

		expect(result.isErr).toBe(false);
		assert(result.isOk);
	});

	it("Success: should delete email verification session after completion", async () => {
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: CORRECT_CODE,
			},
		});
		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		await emailVerificationVerifyEmailUseCase.execute(CORRECT_CODE, userCredentials, emailVerificationRequest);

		expect(emailVerificationRequestMap.has(emailVerificationRequest.id)).toBe(false);
		expect(emailVerificationRequestMap.size).toBe(0);
	});

	it("Success: should update user emailVerified to true after completion", async () => {
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: CORRECT_CODE,
			},
		});
		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		// check before state
		const beforeUser = authUserMap.get(userCredentials.id);
		expect(beforeUser?.emailVerified).toBe(false);

		await emailVerificationVerifyEmailUseCase.execute(CORRECT_CODE, userCredentials, emailVerificationRequest);

		// check after state
		const afterUser = authUserMap.get(userCredentials.id);
		expect(afterUser).toBeDefined();
		assert(afterUser);
		expect(afterUser.emailVerified).toBe(true);

		// check other properties are not changed
		expect(afterUser.email).toBe(userRegistration.email);
		expect(afterUser.name).toBe(userRegistration.name);
		expect(afterUser.id).toBe(userRegistration.id);
	});

	it("Success: should always delete session after successful verification (prevent reuse)", async () => {
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: CORRECT_CODE,
			},
		});
		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		const result = await emailVerificationVerifyEmailUseCase.execute(
			CORRECT_CODE,
			userCredentials,
			emailVerificationRequest,
		);

		assert(result.isOk);

		// check request is deleted
		expect(emailVerificationRequestMap.has(emailVerificationRequest.id)).toBe(false);
	});

	it("Error(invalid code): should return INVALID_CODE error when code is incorrect", async () => {
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: CORRECT_CODE,
			},
		});
		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		const result = await emailVerificationVerifyEmailUseCase.execute(
			WRONG_CODE,
			userCredentials,
			emailVerificationRequest,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_CODE");
	});

	it("Error(invalid code): should return INVALID_CODE error when code is empty", async () => {
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: CORRECT_CODE,
			},
		});
		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		const result = await emailVerificationVerifyEmailUseCase.execute("", userCredentials, emailVerificationRequest);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_CODE");
	});

	it("Error(invalid code): should return INVALID_CODE error when code is partially matched", async () => {
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: CORRECT_CODE,
			},
		});
		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		const partialCode = CORRECT_CODE.slice(0, 4);
		const result = await emailVerificationVerifyEmailUseCase.execute(
			partialCode,
			userCredentials,
			emailVerificationRequest,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_CODE");
	});

	it("Error(invalid code): should not update user information when code does not match", async () => {
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: CORRECT_CODE,
			},
		});
		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		const result = await emailVerificationVerifyEmailUseCase.execute(
			WRONG_CODE,
			userCredentials,
			emailVerificationRequest,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_CODE");

		const user = authUserMap.get(userCredentials.id);
		expect(user?.emailVerified).toBe(false);
	});

	it("Error(email mismatch): should return INVALID_EMAIL error when request email does not match user email", async () => {
		const differentEmail = "different@example.com";
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userRegistration.id,
				email: differentEmail,
				code: CORRECT_CODE,
			},
		});
		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		const result = await emailVerificationVerifyEmailUseCase.execute(
			CORRECT_CODE,
			userCredentials,
			emailVerificationRequest,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_EMAIL");
	});

	it("Error(email mismatch): should delete request when request email mismatch occurs", async () => {
		const differentEmail = "different@example.com";
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userRegistration.id,
				email: differentEmail,
				code: CORRECT_CODE,
			},
		});
		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		await emailVerificationVerifyEmailUseCase.execute(CORRECT_CODE, userCredentials, emailVerificationRequest);

		// check request is deleted
		expect(emailVerificationRequestMap.has(emailVerificationRequest.id)).toBe(false);
		expect(emailVerificationRequestMap.size).toBe(0);
	});

	it("Error(email mismatch): should not update user information when request email does not match user email", async () => {
		const differentEmail = "different@example.com";
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userRegistration.id,
				email: differentEmail,
				code: CORRECT_CODE,
			},
		});
		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		await emailVerificationVerifyEmailUseCase.execute(CORRECT_CODE, userCredentials, emailVerificationRequest);

		const user = authUserMap.get(userCredentials.id);
		expect(user?.emailVerified).toBe(false);
	});
});
