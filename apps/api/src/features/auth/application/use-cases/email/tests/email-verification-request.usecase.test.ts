import { afterEach, describe, expect, it } from "vitest";
import { EmailGatewayMock } from "../../../../../../core/testing/mocks/gateways";
import { RandomGeneratorMock, SessionSecretHasherMock } from "../../../../../../core/testing/mocks/system";
import {
	createAuthUserFixture,
	createEmailVerificationSessionFixture,
	createSessionFixture,
} from "../../../../testing/fixtures";
import {
	EmailVerificationSessionRepositoryMock,
	createEmailVerificationSessionsMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { EmailVerificationRequestUseCase } from "../email-verification-request.usecase";

const sessionMap = createSessionsMap();
const emailVerificationSessionMap = createEmailVerificationSessionsMap();

const emailVerificationSessionRepository = new EmailVerificationSessionRepositoryMock({
	emailVerificationSessionMap,
});
const randomGenerator = new RandomGeneratorMock();
const sessionSecretHasher = new SessionSecretHasherMock();
const emailGateway = new EmailGatewayMock();

const emailVerificationRequestUseCase = new EmailVerificationRequestUseCase(
	emailVerificationSessionRepository,
	randomGenerator,
	sessionSecretHasher,
	emailGateway,
);

const { userIdentity } = createAuthUserFixture({
	userRegistration: {
		email: "test@example.com",
		name: "test_user",
		emailVerified: false,
	},
});

describe("EmailVerificationRequestUseCase", () => {
	afterEach(() => {
		sessionMap.clear();
		emailVerificationSessionMap.clear();
	});

	it("should create email verification request successfully for unverified email", async () => {
		const result = await emailVerificationRequestUseCase.execute(userIdentity);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSession, emailVerificationSessionToken } = result.value;
			expect(emailVerificationSession.email).toBe("test@example.com");
			expect(emailVerificationSession.userId).toBe(userIdentity.id);
			expect(emailVerificationSession.code).toBeDefined();
			expect(emailVerificationSession.code.length).toBe(8);
			expect(typeof emailVerificationSessionToken).toBe("string");
			expect(emailVerificationSessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should return EMAIL_ALREADY_VERIFIED error when trying to verify already verified email", async () => {
		const { userIdentity: verifiedUserIdentity } = createAuthUserFixture({
			userRegistration: {
				email: "verified@example.com",
				name: "verified_user",
				emailVerified: true,
			},
		});

		const result = await emailVerificationRequestUseCase.execute(verifiedUserIdentity);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("EMAIL_ALREADY_VERIFIED");
		}
	});

	it("should delete existing email verification sessions before creating new one", async () => {
		const { emailVerificationSession: existingSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userIdentity.id,
				email: userIdentity.email,
				code: "12345678",
			},
		});

		emailVerificationSessionMap.set(existingSession.id, existingSession);

		expect(emailVerificationSessionMap.size).toBe(1);
		expect(emailVerificationSessionMap.get(existingSession.id)).toBeDefined();

		const result = await emailVerificationRequestUseCase.execute(userIdentity);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSession } = result.value;
			const savedSession = emailVerificationSessionMap.get(emailVerificationSession.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(userIdentity.id);
			expect(savedSession?.email).toBe("test@example.com");
		}
	});

	it("should generate 8-digit numeric verification code", async () => {
		const result = await emailVerificationRequestUseCase.execute(userIdentity);

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
		const result = await emailVerificationRequestUseCase.execute(userIdentity);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSessionToken } = result.value;
			expect(typeof emailVerificationSessionToken).toBe("string");
			expect(emailVerificationSessionToken.length).toBeGreaterThan(0);
		}
	});

	it("should remove obsolete sessions when generating new token", async () => {
		const { session } = createSessionFixture({
			session: {
				userId: userIdentity.id,
			},
		});

		sessionMap.set(session.id, session);

		const { emailVerificationSession: existingEmailVerificationSession } = createEmailVerificationSessionFixture({
			emailVerificationSession: {
				userId: userIdentity.id,
				email: userIdentity.email,
				code: "12345678",
			},
		});
		emailVerificationSessionMap.set(existingEmailVerificationSession.id, existingEmailVerificationSession);
		const result = await emailVerificationRequestUseCase.execute(userIdentity);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { emailVerificationSession } = result.value;
			const savedSession = emailVerificationSessionMap.get(emailVerificationSession.id);
			expect(savedSession).toBeDefined();
			expect(emailVerificationSessionMap.has(existingEmailVerificationSession.id)).toBe(false);
		}
	});
});
