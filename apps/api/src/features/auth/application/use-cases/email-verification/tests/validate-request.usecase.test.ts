import { assert, beforeEach, describe, expect, it } from "vitest";
import { newUserId } from "../../../../../../core/domain/value-objects";
import { ulid } from "../../../../../../core/lib/id";
import { TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { encodeToken, newEmailVerificationRequestToken } from "../../../../domain/value-objects/tokens";
import { createAuthUserFixture, createEmailVerificationRequestFixture } from "../../../../testing/fixtures";
import {
	EmailVerificationRequestRepositoryMock,
	createEmailVerificationRequestsMap,
} from "../../../../testing/mocks/repositories";
import { EmailVerificationValidateRequestUseCase } from "../validate-request.usecase";

const emailVerificationRequestMap = createEmailVerificationRequestsMap();

const emailVerificationRequestRepository = new EmailVerificationRequestRepositoryMock({
	emailVerificationRequestMap,
});

const tokenSecretService = new TokenSecretServiceMock();

const emailVerificationValidateRequestUseCase = new EmailVerificationValidateRequestUseCase(
	emailVerificationRequestRepository,
	tokenSecretService,
);

const { userCredentials } = createAuthUserFixture();

describe("EmailVerificationValidateRequestUseCase", () => {
	beforeEach(() => {
		emailVerificationRequestMap.clear();
	});

	it("Success: should validate email verification request with valid token", async () => {
		const { emailVerificationRequest, emailVerificationRequestToken } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userCredentials.id,
				email: userCredentials.email,
				code: "12345678",
			},
		});

		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		const result = await emailVerificationValidateRequestUseCase.execute(
			userCredentials,
			emailVerificationRequestToken,
		);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { emailVerificationRequest: validatedRequest } = result.value;

		// check expected request is returned
		expect(validatedRequest).toStrictEqual(emailVerificationRequest);
	});

	it("Error(token format): should return INVALID_EMAIL_VERIFICATION_REQUEST error when token format is invalid", async () => {
		const invalidToken = newEmailVerificationRequestToken("invalid_token_format_without_dot");

		const result = await emailVerificationValidateRequestUseCase.execute(userCredentials, invalidToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_EMAIL_VERIFICATION_REQUEST");
	});

	it("Error(token format): should return INVALID_EMAIL_VERIFICATION_REQUEST error when token is empty", async () => {
		const emptyToken = newEmailVerificationRequestToken("");

		const result = await emailVerificationValidateRequestUseCase.execute(userCredentials, emptyToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_EMAIL_VERIFICATION_REQUEST");
	});

	it("Error(token format): should return INVALID_EMAIL_VERIFICATION_REQUEST error when token has only id and no secret", async () => {
		const tokenWithoutSecret = newEmailVerificationRequestToken("someId.");

		const result = await emailVerificationValidateRequestUseCase.execute(userCredentials, tokenWithoutSecret);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_EMAIL_VERIFICATION_REQUEST");
	});

	it("Error(request not found): should return INVALID_EMAIL_VERIFICATION_REQUEST error when request does not exist", async () => {
		const { emailVerificationRequestToken } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userCredentials.id,
				email: userCredentials.email,
			},
		});
		// check request is not saved

		const result = await emailVerificationValidateRequestUseCase.execute(
			userCredentials,
			emailVerificationRequestToken,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_EMAIL_VERIFICATION_REQUEST");
	});

	it("Error(user id mismatch): should return INVALID_EMAIL_VERIFICATION_REQUEST error when request user id does not match user credentials id", async () => {
		const { emailVerificationRequest, emailVerificationRequestToken } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: newUserId(ulid()), // different user id
				email: userCredentials.email,
			},
		});

		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		const result = await emailVerificationValidateRequestUseCase.execute(
			userCredentials,
			emailVerificationRequestToken,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_EMAIL_VERIFICATION_REQUEST");
	});

	it("Error(secret mismatch): should return INVALID_EMAIL_VERIFICATION_REQUEST error when request secret does not match user credentials secret", async () => {
		const { emailVerificationRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userCredentials.id,
				email: userCredentials.email,
			},
		});

		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		// combine valid request id with wrong secret
		const wrongSecret = "wrong_secret";
		const invalidToken = encodeToken(emailVerificationRequest.id, wrongSecret);

		const result = await emailVerificationValidateRequestUseCase.execute(userCredentials, invalidToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_EMAIL_VERIFICATION_REQUEST");
	});

	it("Error(secret modified): should return INVALID_EMAIL_VERIFICATION_REQUEST error when request secret is modified", async () => {
		const { emailVerificationRequest, emailVerificationRequestSecret } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userCredentials.id,
				email: userCredentials.email,
			},
		});

		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		// check secret is modified
		const tamperedSecret = `${emailVerificationRequestSecret}x`;
		const tamperedToken = encodeToken(emailVerificationRequest.id, tamperedSecret);

		const result = await emailVerificationValidateRequestUseCase.execute(userCredentials, tamperedToken);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("INVALID_EMAIL_VERIFICATION_REQUEST");
	});

	it("Error(request expired): should return EXPIRED_EMAIL_VERIFICATION_REQUEST error when request is expired", async () => {
		const { emailVerificationRequest, emailVerificationRequestToken } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userCredentials.id,
				email: userCredentials.email,
				expiresAt: new Date(Date.now() - 1_000),
			},
		});

		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		const result = await emailVerificationValidateRequestUseCase.execute(
			userCredentials,
			emailVerificationRequestToken,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EXPIRED_EMAIL_VERIFICATION_REQUEST");

		// check expired request is deleted
		expect(emailVerificationRequestMap.has(emailVerificationRequest.id)).toBe(false);
	});

	it("Error(request expired): should return EXPIRED_EMAIL_VERIFICATION_REQUEST error when request is expired exactly at the expiration time", async () => {
		const now = new Date();
		const { emailVerificationRequest, emailVerificationRequestToken } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userCredentials.id,
				email: userCredentials.email,
				expiresAt: new Date(now.getTime() - 1), // check request is expired exactly at the expiration time
			},
		});

		emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);

		const result = await emailVerificationValidateRequestUseCase.execute(
			userCredentials,
			emailVerificationRequestToken,
		);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EXPIRED_EMAIL_VERIFICATION_REQUEST");
	});
});
