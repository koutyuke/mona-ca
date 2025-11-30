import { assert, beforeEach, describe, expect, it } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { encodeToken, newEmailVerificationSessionToken } from "../../../../domain/value-objects/tokens";
import { createAuthUserFixture, createEmailVerificationSessionFixture } from "../../../../testing/fixtures";
import {
	EmailVerificationSessionRepositoryMock,
	createEmailVerificationSessionsMap,
} from "../../../../testing/mocks/repositories";
import { EmailVerificationValidateSessionUseCase } from "../validate-session.usecase";

const emailVerificationSessionMap = createEmailVerificationSessionsMap();

const emailVerificationSessionRepository = new EmailVerificationSessionRepositoryMock({
	emailVerificationSessionMap,
});

const tokenSecretService = new TokenSecretServiceMock();

const emailVerificationValidateSessionUseCase = new EmailVerificationValidateSessionUseCase(
	emailVerificationSessionRepository,
	tokenSecretService,
);

const { userCredentials } = createAuthUserFixture();

describe("EmailVerificationValidateSessionUseCase", () => {
	beforeEach(() => {
		emailVerificationSessionMap.clear();
	});

	it("Success: should validate email verification session with valid token", async () => {
		const { emailVerificationSession, emailVerificationSessionToken } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userCredentials.id,
				email: userCredentials.email,
				code: "12345678",
			},
		});

		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await emailVerificationValidateSessionUseCase.execute(
			userCredentials,
			emailVerificationSessionToken,
		);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { emailVerificationSession: validatedSession } = result.value;

		// 期待通りのセッションが返されること
		expect(validatedSession).toStrictEqual(emailVerificationSession);
	});

	it("Error(token format): should return EMAIL_VERIFICATION_SESSION_INVALID error when token format is invalid", async () => {
		const invalidToken = newEmailVerificationSessionToken("invalid_token_format_without_dot");

		const result = await emailVerificationValidateSessionUseCase.execute(userCredentials, invalidToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
	});

	it("Error(token format): should return EMAIL_VERIFICATION_SESSION_INVALID error when token is empty", async () => {
		const emptyToken = newEmailVerificationSessionToken("");

		const result = await emailVerificationValidateSessionUseCase.execute(userCredentials, emptyToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
	});

	it("Error(token format): should return EMAIL_VERIFICATION_SESSION_INVALID error when token has only id and no secret", async () => {
		const tokenWithoutSecret = newEmailVerificationSessionToken("someId.");

		const result = await emailVerificationValidateSessionUseCase.execute(userCredentials, tokenWithoutSecret);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
	});

	it("Error(session not found): should return EMAIL_VERIFICATION_SESSION_INVALID error when session does not exist", async () => {
		const { emailVerificationSessionToken } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userCredentials.id,
				email: userCredentials.email,
			},
		});
		// session is not saved

		const result = await emailVerificationValidateSessionUseCase.execute(
			userCredentials,
			emailVerificationSessionToken,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
	});

	it("Error(user id mismatch): should return EMAIL_VERIFICATION_SESSION_INVALID error when session user id does not match user credentials id", async () => {
		const { emailVerificationSession, emailVerificationSessionToken } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: newUserId(ulid()), // different user id
				email: userCredentials.email,
			},
		});

		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await emailVerificationValidateSessionUseCase.execute(
			userCredentials,
			emailVerificationSessionToken,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
	});

	it("Error(secret mismatch): should return EMAIL_VERIFICATION_SESSION_INVALID error when session secret does not match user credentials secret", async () => {
		const { emailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userCredentials.id,
				email: userCredentials.email,
			},
		});

		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		// 正しいセッションIDに間違ったシークレットを組み合わせる
		const wrongSecret = "wrong_secret";
		const invalidToken = encodeToken(emailVerificationSession.id, wrongSecret);

		const result = await emailVerificationValidateSessionUseCase.execute(userCredentials, invalidToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
	});

	it("Error(secret modified): should return EMAIL_VERIFICATION_SESSION_INVALID error when session secret is modified", async () => {
		const { emailVerificationSession, emailVerificationSessionSecret } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userCredentials.id,
				email: userCredentials.email,
			},
		});

		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		// modify secret
		const tamperedSecret = `${emailVerificationSessionSecret}x`;
		const tamperedToken = encodeToken(emailVerificationSession.id, tamperedSecret);

		const result = await emailVerificationValidateSessionUseCase.execute(userCredentials, tamperedToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_INVALID");
	});

	it("Error(session expired): should return EMAIL_VERIFICATION_SESSION_EXPIRED error when session is expired", async () => {
		const { emailVerificationSession, emailVerificationSessionToken } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userCredentials.id,
				email: userCredentials.email,
				expiresAt: new Date(Date.now() - 1_000),
			},
		});

		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await emailVerificationValidateSessionUseCase.execute(
			userCredentials,
			emailVerificationSessionToken,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_EXPIRED");

		// 期限切れセッションは削除されていること
		expect(emailVerificationSessionMap.has(emailVerificationSession.id)).toBe(false);
	});

	it("Error(session expired): should return EMAIL_VERIFICATION_SESSION_EXPIRED error when session is expired exactly at the expiration time", async () => {
		const now = new Date();
		const { emailVerificationSession, emailVerificationSessionToken } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userCredentials.id,
				email: userCredentials.email,
				expiresAt: new Date(now.getTime() - 1), // 1 millisecond before expiration
			},
		});

		emailVerificationSessionMap.set(emailVerificationSession.id, emailVerificationSession);

		const result = await emailVerificationValidateSessionUseCase.execute(
			userCredentials,
			emailVerificationSessionToken,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_VERIFICATION_SESSION_EXPIRED");
	});
});
