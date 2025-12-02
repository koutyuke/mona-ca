import { assert, afterEach, describe, expect, it } from "vitest";
import { createPasswordResetSessionFixture } from "../../../../testing/fixtures";
import {
	PasswordResetSessionRepositoryMock,
	createPasswordResetSessionsMap,
} from "../../../../testing/mocks/repositories";
import { PasswordResetVerifyEmailUseCase } from "../verify-email.usecase";

const passwordResetSessionMap = createPasswordResetSessionsMap();
const passwordResetSessionRepository = new PasswordResetSessionRepositoryMock({
	passwordResetSessionMap,
});
const passwordResetVerifyEmailUseCase = new PasswordResetVerifyEmailUseCase(passwordResetSessionRepository);

const CORRECT_CODE = "12345678";
const WRONG_CODE = "87654321";

describe("PasswordResetVerifyEmailUseCase", () => {
	afterEach(() => {
		passwordResetSessionMap.clear();
	});

	it("Success: should verify code and update emailVerified to true", async () => {
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				code: CORRECT_CODE,
				email: "test@example.com",
				emailVerified: false,
			},
		});

		passwordResetSessionMap.set(session.id, session);

		const result = await passwordResetVerifyEmailUseCase.execute(CORRECT_CODE, session);

		expect(result.isErr).toBe(false);

		const updatedSession = passwordResetSessionMap.get(session.id);
		expect(updatedSession).toBeDefined();
		assert(updatedSession);

		expect(updatedSession.emailVerified).toBe(true);
		expect(updatedSession.id).toBe(session.id);
		expect(updatedSession.code).toBe(CORRECT_CODE);
		expect(updatedSession.email).toBe(session.email);
	});

	it("Success: should extend session expiration time after successful verification", async () => {
		const originalExpiresAt = new Date(Date.now() + 1000 * 60 * 1); // 10分後
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				code: CORRECT_CODE,
				email: "test@example.com",
				emailVerified: false,
				expiresAt: originalExpiresAt,
			},
		});

		passwordResetSessionMap.set(session.id, session);

		const result = await passwordResetVerifyEmailUseCase.execute(CORRECT_CODE, session);

		expect(result.isErr).toBe(false);

		const updatedSession = passwordResetSessionMap.get(session.id);
		expect(updatedSession).toBeDefined();
		assert(updatedSession);

		// セキュリティ: 認証成功後、セッションの有効期限が延長されること
		expect(updatedSession.expiresAt.getTime()).toBeGreaterThan(originalExpiresAt.getTime());
		expect(updatedSession.emailVerified).toBe(true);
	});

	it("Error: should return INVALID_VERIFICATION_CODE error when code does not match", async () => {
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				code: CORRECT_CODE,
				email: "test@example.com",
				emailVerified: false,
			},
		});

		passwordResetSessionMap.set(session.id, session);

		const result = await passwordResetVerifyEmailUseCase.execute(WRONG_CODE, session);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_VERIFICATION_CODE");

		// セッションが更新されていないこと
		const updatedSession = passwordResetSessionMap.get(session.id);
		expect(updatedSession).toBeDefined();
		assert(updatedSession);
		expect(updatedSession.emailVerified).toBe(false);
		expect(updatedSession.code).toBe(CORRECT_CODE);
	});

	it("Error: should return INVALID_VERIFICATION_CODE error when code is empty", async () => {
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				code: CORRECT_CODE,
				email: "test@example.com",
				emailVerified: false,
			},
		});

		passwordResetSessionMap.set(session.id, session);

		const result = await passwordResetVerifyEmailUseCase.execute("", session);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_VERIFICATION_CODE");

		const updatedSession = passwordResetSessionMap.get(session.id);
		expect(updatedSession?.emailVerified).toBe(false);
	});

	it("Error: should return INVALID_VERIFICATION_CODE error when code is partially matched", async () => {
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				code: CORRECT_CODE,
				email: "test@example.com",
				emailVerified: false,
			},
		});

		passwordResetSessionMap.set(session.id, session);

		const partialCode = CORRECT_CODE.slice(0, 4);
		const result = await passwordResetVerifyEmailUseCase.execute(partialCode, session);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_VERIFICATION_CODE");

		const updatedSession = passwordResetSessionMap.get(session.id);
		expect(updatedSession?.emailVerified).toBe(false);
	});

	it("Error: should not update session when code verification fails", async () => {
		const originalExpiresAt = new Date(Date.now() + 1000 * 60 * 10);
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				code: CORRECT_CODE,
				email: "test@example.com",
				emailVerified: false,
				expiresAt: originalExpiresAt,
			},
		});

		passwordResetSessionMap.set(session.id, session);

		const result = await passwordResetVerifyEmailUseCase.execute(WRONG_CODE, session);

		expect(result.isErr).toBe(true);

		const updatedSession = passwordResetSessionMap.get(session.id);
		expect(updatedSession).toBeDefined();
		assert(updatedSession);

		// セッションが変更されていないこと
		expect(updatedSession.emailVerified).toBe(false);
		expect(updatedSession.expiresAt.getTime()).toBe(originalExpiresAt.getTime());
		expect(updatedSession.code).toBe(CORRECT_CODE);
	});
});
