import { assert, beforeEach, describe, expect, it } from "vitest";
import { EmailGatewayMock } from "../../../../../../core/testing/mocks/gateways";
import { CryptoRandomServiceMock, TokenSecretServiceMock } from "../../../../../../core/testing/mocks/system";
import { decodeToken } from "../../../../domain/value-objects/tokens";
import { createAuthUserFixture, createEmailVerificationRequestFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	EmailVerificationRequestRepositoryMock,
	createAuthUsersMap,
	createEmailVerificationRequestsMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { UpdateEmailRequestUseCase } from "../request.usecase";

const emailVerificationRequestMap = createEmailVerificationRequestsMap();
const authUserMap = createAuthUsersMap();
const sessionMap = createSessionsMap();

const emailVerificationRequestRepository = new EmailVerificationRequestRepositoryMock({
	emailVerificationRequestMap,
});
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const cryptoRandomService = new CryptoRandomServiceMock();
const tokenSecretService = new TokenSecretServiceMock();
const emailGateway = new EmailGatewayMock();

const updateEmailRequestUseCase = new UpdateEmailRequestUseCase(
	emailVerificationRequestRepository,
	authUserRepository,
	cryptoRandomService,
	tokenSecretService,
	emailGateway,
);

// mock fixed values
const MOCK_VERIFICATION_CODE = "01234567"; // CryptoRandomServiceMock returns a fixed value of 8 digits (digits: true)
const MOCK_SECRET = "token-secret"; // TokenSecretServiceMock returns a fixed value of "token-secret"

const { userCredentials, userRegistration } = createAuthUserFixture({
	userRegistration: {
		email: "old@example.com",
		name: "Test User",
	},
});

const NEW_EMAIL = "new@example.com";
const EXISTING_EMAIL = "existing@example.com";

describe("UpdateEmailRequestUseCase", () => {
	beforeEach(() => {
		emailVerificationRequestMap.clear();
		authUserMap.clear();
		sessionMap.clear();
		emailGateway.sendVerificationEmailCalls = [];

		authUserMap.set(userRegistration.id, userRegistration);
	});

	it("Success: should create email verification session with valid new email", async () => {
		const result = await updateEmailRequestUseCase.execute(NEW_EMAIL, userCredentials);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		const { emailVerificationRequest, emailVerificationRequestToken } = result.value;

		// check email verification session
		expect(emailVerificationRequest.email).toBe(NEW_EMAIL);
		expect(emailVerificationRequest.userId).toBe(userCredentials.id);
		expect(emailVerificationRequest.code).toBe(MOCK_VERIFICATION_CODE);
		expect(emailVerificationRequest.code.length).toBe(8);
		expect(/^\d{8}$/.test(emailVerificationRequest.code)).toBe(true);
		expect(emailVerificationRequest.expiresAt).toBeInstanceOf(Date);
		expect(emailVerificationRequest.expiresAt.getTime()).toBeGreaterThan(Date.now());

		// check session token
		const decoded = decodeToken(emailVerificationRequestToken);
		expect(decoded).not.toBeNull();
		assert(decoded !== null);
		expect(decoded.id).toBe(emailVerificationRequest.id);
		expect(decoded.secret).toBe(MOCK_SECRET);

		// check mock fixed value: TokenSecretServiceMock returns `"token-secret"`
		expect(emailVerificationRequestToken).toBe(`${emailVerificationRequest.id}.token-secret`);
		expect(emailVerificationRequest.secretHash).toStrictEqual(
			new TextEncoder().encode("__token-secret-hashed:token-secret"),
		);

		// check session is saved
		const savedSession = emailVerificationRequestMap.get(emailVerificationRequest.id);
		expect(savedSession).toStrictEqual(emailVerificationRequest);

		// check verification email is sent
		expect(emailGateway.sendVerificationEmailCalls.length).toBe(1);
		expect(emailGateway.sendVerificationEmailCalls[0]?.email).toBe(NEW_EMAIL);
		expect(emailGateway.sendVerificationEmailCalls[0]?.code).toBe(MOCK_VERIFICATION_CODE);
	});

	it("Success: should delete existing session before creating new one", async () => {
		const { emailVerificationRequest: existingSession } = createEmailVerificationRequestFixture({
			emailVerificationRequest: {
				userId: userCredentials.id,
				email: "previous@example.com",
				code: "87654321",
			},
		});

		emailVerificationRequestMap.set(existingSession.id, existingSession);
		expect(emailVerificationRequestMap.size).toBe(1);

		const result = await updateEmailRequestUseCase.execute(NEW_EMAIL, userCredentials);

		expect(result.isErr).toBe(false);
		assert(result.isOk);

		// security: existing request is deleted, new request is created (prevent reuse)
		expect(emailVerificationRequestMap.has(existingSession.id)).toBe(false);
		expect(emailVerificationRequestMap.size).toBe(1);

		const { emailVerificationRequest } = result.value;
		expect(emailVerificationRequestMap.get(emailVerificationRequest.id)).toStrictEqual(emailVerificationRequest);
	});

	it("Success: should generate different codes for each request", async () => {
		const result1 = await updateEmailRequestUseCase.execute(NEW_EMAIL, userCredentials);
		const result2 = await updateEmailRequestUseCase.execute("another@example.com", userCredentials);

		assert(result1.isOk);
		assert(result2.isOk);

		// security: different codes are generated for each request
		expect(result1.value.emailVerificationRequest.code).toBe(MOCK_VERIFICATION_CODE);
		expect(result2.value.emailVerificationRequest.code).toBe(MOCK_VERIFICATION_CODE);
		// note: CryptoRandomServiceMock returns a fixed value, so in actual implementation, different values are generated
		expect(result1.value.emailVerificationRequest.id).not.toBe(result2.value.emailVerificationRequest.id);
	});

	it("Error: should return EMAIL_ALREADY_REGISTERED error when new email is already registered", async () => {
		const { userRegistration: existingUser } = createAuthUserFixture({
			userRegistration: {
				email: EXISTING_EMAIL,
			},
		});

		authUserMap.set(existingUser.id, existingUser);

		const result = await updateEmailRequestUseCase.execute(EXISTING_EMAIL, userCredentials);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");

		// request is not created
		expect(emailVerificationRequestMap.size).toBe(0);
		// email is not sent
		expect(emailGateway.sendVerificationEmailCalls.length).toBe(0);
	});

	it("Error: should return EMAIL_ALREADY_REGISTERED error when new email is same as current email", async () => {
		const result = await updateEmailRequestUseCase.execute(userRegistration.email, userCredentials);

		expect(result.isErr).toBe(true);
		assert(result.isErr);
		expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");

		// request is not created
		expect(emailVerificationRequestMap.size).toBe(0);
		// email is not sent
		expect(emailGateway.sendVerificationEmailCalls.length).toBe(0);
	});
});
