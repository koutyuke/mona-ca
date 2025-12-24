import { assert, beforeEach, describe, expect, it } from "vitest";
import { EmailGatewayMock } from "../../../../../../core/testing/mocks/gateways";
import { CryptoRandomServiceMock, TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { decodeToken } from "../../../../domain/value-objects/tokens";
import { createAuthUserFixture, createEmailVerificationRequestFixture } from "../../../../testing/fixtures";
import {
	EmailVerificationRequestRepositoryMock,
	createEmailVerificationRequestMap,
} from "../../../../testing/mocks/repositories";
import { EmailVerificationRequestUseCase } from "../request.usecase";

const emailVerificationRequestMap = createEmailVerificationRequestMap();

const emailVerificationRequestRepository = new EmailVerificationRequestRepositoryMock({
	emailVerificationRequestMap,
});

const cryptoRandomService = new CryptoRandomServiceMock();
const tokenSecretService = new TokenSecretServiceMock();
const emailGateway = new EmailGatewayMock();

const emailVerificationRequestUseCase = new EmailVerificationRequestUseCase(
	emailGateway,
	emailVerificationRequestRepository,
	cryptoRandomService,
	tokenSecretService,
);

const MOCK_VERIFICATION_CODE = "01234567";
const MOCK_SECRET = "token-secret";

const TEST_EMAIL = "test@example.com";
const TEST_NAME = "test_user";

const { userCredentials } = createAuthUserFixture({
	userRegistration: {
		email: TEST_EMAIL,
		name: TEST_NAME,
		emailVerified: false,
	},
});

describe("EmailVerificationRequestUseCase", () => {
	beforeEach(() => {
		emailVerificationRequestMap.clear();
		emailGateway.sendVerificationEmailCalls = [];
	});

	it("Success: should create session and return token for unverified email address", async () => {
		const result = await emailVerificationRequestUseCase.execute(userCredentials);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { emailVerificationRequest, emailVerificationRequestToken } = result.value;

		// check properties
		expect(emailVerificationRequest.email).toBe(TEST_EMAIL);
		expect(emailVerificationRequest.userId).toBe(userCredentials.id);
		expect(emailVerificationRequest.code).toBe(MOCK_VERIFICATION_CODE);
		expect(emailVerificationRequest.expiresAt).toBeInstanceOf(Date);
		expect(emailVerificationRequest.expiresAt.getTime()).toBeGreaterThan(Date.now());

		// check token format
		const decoded = decodeToken(emailVerificationRequestToken);
		expect(decoded).not.toBeNull();
		assert(decoded !== null);
		expect(decoded.id).toBe(emailVerificationRequest.id);
		expect(decoded.secret).toBe(MOCK_SECRET);
	});

	it("Success: should save request to repository", async () => {
		const result = await emailVerificationRequestUseCase.execute(userCredentials);

		assert(result.isOk);
		const { emailVerificationRequest } = result.value;

		const savedRequest = emailVerificationRequestMap.get(emailVerificationRequest.id);
		expect(savedRequest).toStrictEqual(emailVerificationRequest);
	});

	it("Success: should send verification email with correct recipient and code", async () => {
		const result = await emailVerificationRequestUseCase.execute(userCredentials);

		assert(result.isOk);

		expect(emailGateway.sendVerificationEmailCalls).toHaveLength(1);

		const emailCall = emailGateway.sendVerificationEmailCalls[0];
		expect(emailCall?.email).toBe(TEST_EMAIL);
		expect(emailCall?.code).toBe(MOCK_VERIFICATION_CODE);
	});

	it("Success: should delete existing request before creating new request", async () => {
		// create existing request
		const { emailVerificationRequest: existingRequest } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userCredentials.id,
				email: userCredentials.email,
				code: "87654321",
			},
		});
		emailVerificationRequestMap.set(existingRequest.id, existingRequest);

		expect(emailVerificationRequestMap.size).toBe(1);
		expect(emailVerificationRequestMap.get(existingRequest.id)).toStrictEqual(existingRequest);

		// create new request
		const result = await emailVerificationRequestUseCase.execute(userCredentials);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		// old request is deleted
		expect(emailVerificationRequestMap.has(existingRequest.id)).toBe(false);

		// new request is only exists
		expect(emailVerificationRequestMap.size).toBe(1);
		const { emailVerificationRequest } = result.value;
		expect(emailVerificationRequestMap.get(emailVerificationRequest.id)).toStrictEqual(emailVerificationRequest);
	});

	it("Success: should keep only the latest request when called multiple times consecutively", async () => {
		// first time
		const result1 = await emailVerificationRequestUseCase.execute(userCredentials);
		assert(result1.isOk);
		const request1 = result1.value.emailVerificationRequest;

		// second time
		const result2 = await emailVerificationRequestUseCase.execute(userCredentials);
		assert(result2.isOk);
		const request2 = result2.value.emailVerificationRequest;

		// old request is deleted, new request is only exists
		expect(emailVerificationRequestMap.has(request1.id)).toBe(false);
		expect(emailVerificationRequestMap.has(request2.id)).toBe(true);
		expect(emailVerificationRequestMap.size).toBe(1);
	});

	it("Success: should generate 8-digit numeric verification code", async () => {
		const result = await emailVerificationRequestUseCase.execute(userCredentials);

		assert(result.isOk);
		const { emailVerificationRequest } = result.value;

		// check fixed value
		expect(emailVerificationRequest.code).toBe(MOCK_VERIFICATION_CODE);

		// check 8 digits
		expect(emailVerificationRequest.code).toHaveLength(8);

		// check only digits
		expect(emailVerificationRequest.code).toMatch(/^\d{8}$/);
	});

	it("Success: should include secret in request token", async () => {
		const result = await emailVerificationRequestUseCase.execute(userCredentials);

		assert(result.isOk);
		const { emailVerificationRequestToken } = result.value;

		const decoded = decodeToken(emailVerificationRequestToken);
		expect(decoded).not.toBeNull();
		assert(decoded !== null);

		// check secret is not empty
		expect(decoded.secret).toBeTruthy();
		expect(decoded.secret).toBe(MOCK_SECRET);
	});

	it("Success: should save secret hash to request", async () => {
		const result = await emailVerificationRequestUseCase.execute(userCredentials);

		assert(result.isOk);
		const { emailVerificationRequest } = result.value;

		// check secretHash exists
		expect(emailVerificationRequest.secretHash).toBeDefined();
		expect(emailVerificationRequest.secretHash).toBeInstanceOf(Uint8Array);
		expect(emailVerificationRequest.secretHash.length).toBeGreaterThan(0);

		// check secretHash is not raw secret
		const secretBytes = new TextEncoder().encode(MOCK_SECRET);
		expect(emailVerificationRequest.secretHash).not.toEqual(secretBytes);
	});

	it("Success: should set expiration time on request", async () => {
		const beforeExecution = Date.now();
		const result = await emailVerificationRequestUseCase.execute(userCredentials);

		assert(result.isOk);
		const { emailVerificationRequest } = result.value;

		// check expiresAt is after current time
		expect(emailVerificationRequest.expiresAt.getTime()).toBeGreaterThan(beforeExecution);
	});

	it("Error(email already verified): should return EMAIL_ALREADY_VERIFIED error when email is already verified", async () => {
		const { userCredentials: verifiedUserCredentials } = createAuthUserFixture({
			userRegistration: {
				email: "verified@example.com",
				name: "verified_user",
				emailVerified: true,
			},
		});

		const result = await emailVerificationRequestUseCase.execute(verifiedUserCredentials);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_ALREADY_VERIFIED");

		// check email is not sent
		expect(emailGateway.sendVerificationEmailCalls).toHaveLength(0);

		// check request is not created
		expect(emailVerificationRequestMap.size).toBe(0);
	});
});
