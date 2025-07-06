import { beforeEach, describe, expect, it } from "vitest";
import { isErr, ulid } from "../../../../common/utils";
import { createPasswordResetSession } from "../../../../domain/entities";
import { newPasswordResetSessionId, newUserId } from "../../../../domain/value-object";
import { SessionSecretServiceMock } from "../../../../tests/mocks";
import { PasswordResetSessionRepositoryMock } from "../../../../tests/mocks/repositories/password-reset-session.repository.mock";
import { createPasswordResetSessionsMap } from "../../../../tests/mocks/repositories/table-maps";
import { PasswordResetVerifyEmailUseCase } from "../password-reset-verify-email.usecase";

describe("PasswordResetVerifyEmailUseCase", () => {
	let passwordResetVerifyEmailUseCase: PasswordResetVerifyEmailUseCase;
	let passwordResetSessionRepositoryMock: PasswordResetSessionRepositoryMock;

	beforeEach(() => {
		const passwordResetSessionMap = createPasswordResetSessionsMap();

		passwordResetSessionRepositoryMock = new PasswordResetSessionRepositoryMock({
			passwordResetSessionMap,
		});

		passwordResetVerifyEmailUseCase = new PasswordResetVerifyEmailUseCase(passwordResetSessionRepositoryMock);
	});

	it("should verify email successfully with correct code", async () => {
		// create password reset session
		const sessionId = newPasswordResetSessionId(ulid());
		const userId = newUserId(ulid());
		const code = "12345678";
		const sessionSecretServiceMock = new SessionSecretServiceMock();
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createPasswordResetSession({
			id: sessionId,
			userId: userId,
			code: code,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: "test@example.com",
		});

		// set initial state
		session.emailVerified = false;
		passwordResetSessionRepositoryMock.passwordResetSessionMap.set(sessionId, session);

		const result = await passwordResetVerifyEmailUseCase.execute(code, session);

		expect(isErr(result)).toBe(false);

		// verify session is updated
		const updatedSession = passwordResetSessionRepositoryMock.passwordResetSessionMap.get(sessionId);
		expect(updatedSession).toBeDefined();
		expect(updatedSession?.emailVerified).toBe(true);
	});

	it("should return INVALID_VERIFICATION_CODE error when code does not match", async () => {
		// create password reset session
		const sessionId = newPasswordResetSessionId(ulid());
		const userId = newUserId(ulid());
		const correctCode = "12345678";
		const sessionSecretServiceMock = new SessionSecretServiceMock();
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createPasswordResetSession({
			id: sessionId,
			userId: userId,
			code: correctCode,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: "test@example.com",
		});

		// set initial state
		session.emailVerified = false;
		passwordResetSessionRepositoryMock.passwordResetSessionMap.set(sessionId, session);

		const wrongCode = "87654321";
		const result = await passwordResetVerifyEmailUseCase.execute(wrongCode, session);

		expect(isErr(result)).toBe(true);

		if (isErr(result)) {
			expect(result.code).toBe("INVALID_VERIFICATION_CODE");
		}

		// verify session is not updated
		const unchangedSession = passwordResetSessionRepositoryMock.passwordResetSessionMap.get(sessionId);
		expect(unchangedSession?.emailVerified).toBe(false);
	});

	it("should update emailVerified to true when verification succeeds", async () => {
		// create password reset session
		const sessionId = newPasswordResetSessionId(ulid());
		const userId = newUserId(ulid());
		const code = "12345678";
		const sessionSecretServiceMock = new SessionSecretServiceMock();
		const sessionSecret = sessionSecretServiceMock.generateSessionSecret();
		const session = createPasswordResetSession({
			id: sessionId,
			userId: userId,
			code: code,
			secretHash: sessionSecretServiceMock.hashSessionSecret(sessionSecret),
			email: "test@example.com",
		});

		// set initial state
		session.emailVerified = false;
		passwordResetSessionRepositoryMock.passwordResetSessionMap.set(sessionId, session);

		const result = await passwordResetVerifyEmailUseCase.execute(code, session);

		expect(isErr(result)).toBe(false);

		// verify session is updated and saved
		const updatedSession = passwordResetSessionRepositoryMock.passwordResetSessionMap.get(sessionId);
		expect(updatedSession).toBeDefined();
		expect(updatedSession?.emailVerified).toBe(true);
		expect(updatedSession?.id).toBe(sessionId);
		expect(updatedSession?.userId).toBe(userId);
		expect(updatedSession?.code).toBe(code);
		expect(updatedSession?.email).toBe("test@example.com");
	});
});
