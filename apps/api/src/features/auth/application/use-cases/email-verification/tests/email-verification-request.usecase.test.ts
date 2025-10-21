import { afterEach, describe, expect, it } from "vitest";
import { EmailGatewayMock } from "../../../../../../shared/testing/mocks/gateways";
import { RandomGeneratorMock, SessionSecretHasherMock } from "../../../../../../shared/testing/mocks/system";
import {
	createAuthUserFixture,
	createEmailVerificationSessionFixture,
	createSessionFixture,
} from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	EmailVerificationSessionRepositoryMock,
	createAuthUsersMap,
	createEmailVerificationSessionsMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { EmailVerificationRequestUseCase } from "../email-verification-request.usecase";

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
const randomGenerator = new RandomGeneratorMock();
const sessionSecretHasher = new SessionSecretHasherMock();
const emailGateway = new EmailGatewayMock();

const emailVerificationRequestUseCase = new EmailVerificationRequestUseCase(
	emailVerificationSessionRepository,
	authUserRepository,
	randomGenerator,
	sessionSecretHasher,
	emailGateway,
);

const { userRegistration, userIdentity } = createAuthUserFixture({
	userRegistration: {
		email: "test@example.com",
		name: "test_user",
		emailVerified: false,
	},
});

describe("EmailVerificationRequestUseCase", () => {
	afterEach(() => {
		authUserMap.clear();
		sessionMap.clear();
		emailVerificationSessionMap.clear();
	});

	it("should create email verification request successfully for new email", async () => {
		authUserMap.set(userRegistration.id, userRegistration);

		const result = await emailVerificationRequestUseCase.execute("new@example.com", userIdentity);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSession, emailVerificationSessionToken } = result.value;
			expect(emailVerificationSession.email).toBe("new@example.com");
			expect(emailVerificationSession.userId).toBe(userIdentity.id);
			expect(emailVerificationSession.code).toBeDefined();
			expect(emailVerificationSession.code.length).toBe(8);
			expect(typeof emailVerificationSessionToken).toBe("string");
			expect(emailVerificationSessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should create email verification request successfully for unverified current email", async () => {
		const updatedUserRegistration = { ...userRegistration, emailVerified: false };
		authUserMap.set(userRegistration.id, updatedUserRegistration);

		const result = await emailVerificationRequestUseCase.execute("test@example.com", userIdentity);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSession } = result.value;
			expect(emailVerificationSession.email).toBe("test@example.com");
			expect(emailVerificationSession.userId).toBe(userRegistration.id);
		}
	});

	it("should return EMAIL_ALREADY_VERIFIED error when trying to verify already verified email", async () => {
		const updatedUserRegistration = { ...userRegistration, emailVerified: true };

		authUserMap.set(userRegistration.id, updatedUserRegistration);

		const result = await emailVerificationRequestUseCase.execute("test@example.com", updatedUserRegistration);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_ALREADY_VERIFIED");
		}
	});

	it("should return EMAIL_ALREADY_REGISTERED error when email is already used by another user", async () => {
		const { userRegistration: anotherUserRegistration } = createAuthUserFixture({
			userRegistration: {
				email: "existing@example.com",
				name: "another_user",
				emailVerified: true,
			},
		});

		authUserMap.set(userRegistration.id, userRegistration);
		authUserMap.set(anotherUserRegistration.id, anotherUserRegistration);

		const result = await emailVerificationRequestUseCase.execute("existing@example.com", userIdentity);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_ALREADY_REGISTERED");
		}
	});

	it("should delete existing email verification sessions before creating new one", async () => {
		authUserMap.set(userRegistration.id, userRegistration);

		const { emailVerificationSession: existingSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userRegistration.id,
				email: userRegistration.email,
				code: "12345678",
			},
		});

		emailVerificationSessionMap.set(existingSession.id, existingSession);

		expect(emailVerificationSessionMap.size).toBe(1);
		expect(emailVerificationSessionMap.get(existingSession.id)).toBeDefined();

		const result = await emailVerificationRequestUseCase.execute("new@example.com", userIdentity);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSession } = result.value;
			const savedSession = emailVerificationSessionMap.get(emailVerificationSession.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(userIdentity.id);
			expect(savedSession?.email).toBe("new@example.com");
		}
	});

	it("should generate 8-digit numeric verification code", async () => {
		authUserMap.set(userRegistration.id, userRegistration);

		const result = await emailVerificationRequestUseCase.execute("new@example.com", userRegistration);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSession } = result.value;
			const code = emailVerificationSession.code;
			expect(code).toBeDefined();
			expect(code.length).toBe(8);
			expect(/^\d{8}$/.test(code)).toBe(true);
		}
	});

	it("should create session token with correct format", async () => {
		authUserMap.set(userRegistration.id, userRegistration);

		const result = await emailVerificationRequestUseCase.execute("new@example.com", userIdentity);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSessionToken } = result.value;
			expect(typeof emailVerificationSessionToken).toBe("string");
			expect(emailVerificationSessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should remove obsolete sessions when generating new token", async () => {
		authUserMap.set(userRegistration.id, userRegistration);

		const { session } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});

		sessionMap.set(session.id, session);

		const result = await emailVerificationRequestUseCase.execute("new@example.com", userIdentity);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSession } = result.value;
			const savedSession = emailVerificationSessionMap.get(emailVerificationSession.id);
			expect(savedSession).toBeDefined();
		}
	});
});
