import { assert, beforeEach, describe, expect, it } from "vitest";
import { createAuthUserFixture, createEmailVerificationSessionFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	EmailVerificationSessionRepositoryMock,
	createAuthUsersMap,
	createEmailVerificationSessionsMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { EmailVerificationVerifyEmailUseCase } from "../verify-email.usecase";

const authUserMap = createAuthUsersMap();
const sessionMap = createSessionsMap();
const emailVerificationSessionMap = createEmailVerificationSessionsMap();

const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const emailVerificationSessionRepository = new EmailVerificationSessionRepositoryMock({
	emailVerificationSessionMap,
});

const emailVerificationVerifyEmailUseCase = new EmailVerificationVerifyEmailUseCase(
	authUserRepository,
	emailVerificationSessionRepository,
);

const TEST_EMAIL = "test@example.com";
const TEST_NAME = "test_user";
const CORRECT_CODE = "12345678";

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
		emailVerificationSessionMap.clear();

		authUserMap.set(userRegistration.id, { ...userRegistration });
	});

	it("Success: should complete email verification with correct code", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: CORRECT_CODE,
			},
		});
		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await emailVerificationVerifyEmailUseCase.execute(
			CORRECT_CODE,
			userCredentials,
			emailVerificationSession,
		);

		expect(result.isErr).toBe(false);
		assert(result.isOk);
	});

	it("Success: should delete email verification session after completion", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: CORRECT_CODE,
			},
		});
		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		await emailVerificationVerifyEmailUseCase.execute(CORRECT_CODE, userCredentials, emailVerificationSession);

		expect(emailVerificationSessionMap.has(emailVerificationSession.id)).toBe(false);
		expect(emailVerificationSessionMap.size).toBe(0);
	});

	it("Success: should update user emailVerified to true after completion", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: CORRECT_CODE,
			},
		});
		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		// 認証前の状態を確認
		const beforeUser = authUserMap.get(userCredentials.id);
		expect(beforeUser?.emailVerified).toBe(false);

		await emailVerificationVerifyEmailUseCase.execute(CORRECT_CODE, userCredentials, emailVerificationSession);

		// 認証後の状態を確認
		const afterUser = authUserMap.get(userCredentials.id);
		expect(afterUser).toBeDefined();
		assert(afterUser);
		expect(afterUser.emailVerified).toBe(true);

		// 他のプロパティは変更されていないこと
		expect(afterUser.email).toBe(userRegistration.email);
		expect(afterUser.name).toBe(userRegistration.name);
		expect(afterUser.id).toBe(userRegistration.id);
	});

	it("Success: should always delete session after successful verification (prevent reuse)", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: CORRECT_CODE,
			},
		});
		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await emailVerificationVerifyEmailUseCase.execute(
			CORRECT_CODE,
			userCredentials,
			emailVerificationSession,
		);

		assert(result.isOk);

		// セッションが削除されていること
		expect(emailVerificationSessionMap.has(emailVerificationSession.id)).toBe(false);

		// 同じセッションで再度認証を試みる（このテストはuse-caseの外側での防御だが、念のため）
		// 実際にはvalidate-sessionで弾かれるが、completeでもセッション削除は重要
	});

	it("Error(invalid code): should return INVALID_VERIFICATION_CODE error when code is incorrect", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: CORRECT_CODE,
			},
		});
		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const wrongCode = "87654321";
		const result = await emailVerificationVerifyEmailUseCase.execute(
			wrongCode,
			userCredentials,
			emailVerificationSession,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_VERIFICATION_CODE");
	});

	it("Error(invalid code): should return INVALID_VERIFICATION_CODE error when code is empty", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: CORRECT_CODE,
			},
		});
		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await emailVerificationVerifyEmailUseCase.execute("", userCredentials, emailVerificationSession);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_VERIFICATION_CODE");
	});

	it("Error(invalid code): should return INVALID_VERIFICATION_CODE error when code is partially matched", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: CORRECT_CODE,
			},
		});
		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const partialCode = CORRECT_CODE.slice(0, 4);
		const result = await emailVerificationVerifyEmailUseCase.execute(
			partialCode,
			userCredentials,
			emailVerificationSession,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_VERIFICATION_CODE");
	});

	it("Error(invalid code): should not update user information when code is incorrect", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: CORRECT_CODE,
			},
		});
		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		await emailVerificationVerifyEmailUseCase.execute("wrongcode", userCredentials, emailVerificationSession);

		const user = authUserMap.get(userCredentials.id);
		expect(user?.emailVerified).toBe(false);
	});

	it("Error(email mismatch): should return EMAIL_MISMATCH error when session email does not match user email", async () => {
		const differentEmail = "different@example.com";
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
				email: differentEmail,
				code: CORRECT_CODE,
			},
		});
		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await emailVerificationVerifyEmailUseCase.execute(
			CORRECT_CODE,
			userCredentials,
			emailVerificationSession,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_MISMATCH");
	});

	it("Error(email mismatch): should delete session when email mismatch occurs", async () => {
		const differentEmail = "different@example.com";
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
				email: differentEmail,
				code: CORRECT_CODE,
			},
		});
		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		await emailVerificationVerifyEmailUseCase.execute(CORRECT_CODE, userCredentials, emailVerificationSession);

		// セキュリティ上の理由でセッションは削除されること
		expect(emailVerificationSessionMap.has(emailVerificationSession.id)).toBe(false);
	});

	it("Error(email mismatch): should not update user information when email mismatch occurs", async () => {
		const differentEmail = "different@example.com";
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
				email: differentEmail,
				code: CORRECT_CODE,
			},
		});
		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		await emailVerificationVerifyEmailUseCase.execute(CORRECT_CODE, userCredentials, emailVerificationSession);

		const user = authUserMap.get(userCredentials.id);
		expect(user?.emailVerified).toBe(false);
	});
});
