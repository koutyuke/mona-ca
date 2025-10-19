import { beforeEach, describe, expect, it } from "vitest";
import { createPasswordResetSessionFixture } from "../../../../testing/fixtures";
import {
	PasswordResetSessionRepositoryMock,
	createPasswordResetSessionsMap,
} from "../../../../testing/mocks/repositories";
import { PasswordResetVerifyEmailUseCase } from "../password-reset-verify-email.usecase";

const passwordResetSessionMap = createPasswordResetSessionsMap();
const passwordResetSessionRepository = new PasswordResetSessionRepositoryMock({
	passwordResetSessionMap,
});
const passwordResetVerifyEmailUseCase = new PasswordResetVerifyEmailUseCase(passwordResetSessionRepository);

describe("PasswordResetVerifyEmailUseCase", () => {
	beforeEach(() => {
		passwordResetSessionMap.clear();
	});

	it("should verify email successfully with correct code", async () => {
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				code: "12345678",
				email: "test@example.com",
				emailVerified: false,
			},
		});

		passwordResetSessionMap.set(session.id, session);

		const result = await passwordResetVerifyEmailUseCase.execute("12345678", session);

		expect(result.isErr).toBe(false);

		const updatedSession = passwordResetSessionMap.get(session.id);
		expect(updatedSession).toBeDefined();
		expect(updatedSession?.emailVerified).toBe(true);
	});

	it("should return INVALID_VERIFICATION_CODE error when code does not match", async () => {
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				code: "12345678",
				email: "test@example.com",
				emailVerified: false,
			},
		});

		passwordResetSessionMap.set(session.id, session);

		const result = await passwordResetVerifyEmailUseCase.execute("87654321", session);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("INVALID_VERIFICATION_CODE");
		}

		expect(passwordResetSessionMap.get(session.id)?.emailVerified).toBe(false);
	});

	it("should update emailVerified to true when verification succeeds", async () => {
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				code: "12345678",
				email: "test@example.com",
				emailVerified: false,
			},
		});

		passwordResetSessionMap.set(session.id, session);

		const result = await passwordResetVerifyEmailUseCase.execute("12345678", session);

		expect(result.isErr).toBe(false);

		const updatedSession = passwordResetSessionMap.get(session.id);
		expect(updatedSession).toBeDefined();
		expect(updatedSession?.emailVerified).toBe(true);
		expect(updatedSession?.id).toBe(session.id);
	});

	it("should update password reset session expires at if success", async () => {
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				code: "12345678",
				email: "test@example.com",
				emailVerified: false,
			},
		});

		passwordResetSessionMap.set(session.id, session);

		const result = await passwordResetVerifyEmailUseCase.execute("12345678", session);

		expect(result.isErr).toBe(false);

		const updatedSession = passwordResetSessionMap.get(session.id);
		expect(updatedSession).toBeDefined();
		expect(updatedSession?.expiresAt.getTime()).toBeGreaterThan(session.expiresAt.getTime());
	});
});
