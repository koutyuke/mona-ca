import { beforeEach, describe, expect, it } from "vitest";
import { PasswordHasherMock } from "../../../../../../shared/testing/mocks/system";
import {
	createAuthUserFixture,
	createPasswordResetSessionFixture,
	createSessionFixture,
} from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	PasswordResetSessionRepositoryMock,
	SessionRepositoryMock,
	createAuthUserMap,
	createPasswordResetSessionsMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { ResetPasswordUseCase } from "../reset-password.usecase";

const passwordResetSessionMap = createPasswordResetSessionsMap();
const sessionMap = createSessionsMap();
const authUserMap = createAuthUserMap();

const passwordResetSessionRepository = new PasswordResetSessionRepositoryMock({
	passwordResetSessionMap,
});
const sessionRepository = new SessionRepositoryMock({
	sessionMap,
});
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const passwordHasher = new PasswordHasherMock();

const resetPasswordUseCase = new ResetPasswordUseCase(
	authUserRepository,
	sessionRepository,
	passwordResetSessionRepository,
	passwordHasher,
);

const { userRegistration: user } = createAuthUserFixture({
	userRegistration: {
		email: "test@example.com",
		name: "test_user",
	},
});

describe("ResetPasswordUseCase", () => {
	beforeEach(() => {
		passwordResetSessionMap.clear();
		sessionMap.clear();
		authUserMap.clear();
	});

	it("should reset password successfully when email is verified", async () => {
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
				emailVerified: true,
			},
		});

		authUserMap.set(user.id, user);

		const newPassword = "new_password123";
		const result = await resetPasswordUseCase.execute(newPassword, session, user);

		expect(result.isErr).toBe(false);

		const savedUser = authUserMap.get(user.id);
		expect(savedUser).toBeDefined();
		expect(savedUser?.id).toBe(user.id);
	});

	it("should return REQUIRED_EMAIL_VERIFICATION error when email is not verified", async () => {
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
				emailVerified: false,
			},
		});

		authUserMap.set(user.id, user);

		const result = await resetPasswordUseCase.execute("new_password123", session, user);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("REQUIRED_EMAIL_VERIFICATION");
		}
	});

	it("should hash password before saving", async () => {
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
				emailVerified: true,
			},
		});

		authUserMap.set(user.id, user);

		const newPassword = "new_password123";
		const result = await resetPasswordUseCase.execute(newPassword, session, user);

		expect(result.isErr).toBe(false);

		const savedUser = authUserMap.get(user.id);
		expect(savedUser?.passwordHash).toBeDefined();
		expect(savedUser?.passwordHash).not.toBe(newPassword);
		if (savedUser?.passwordHash) {
			expect(await passwordHasher.verify(newPassword, savedUser.passwordHash)).toBe(true);
		}
	});

	it("should delete all user sessions after password reset", async () => {
		const { session: existingSession1 } = createSessionFixture({
			session: {
				userId: user.id,
			},
		});

		sessionMap.set(existingSession1.id, existingSession1);

		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
				emailVerified: true,
			},
		});

		authUserMap.set(user.id, user);

		const result = await resetPasswordUseCase.execute("new_password123", session, user);

		expect(result.isErr).toBe(false);

		expect(sessionMap.size).toBe(0);
	});

	it("should delete password reset sessions for the user", async () => {
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
				emailVerified: true,
			},
		});
		const { passwordResetSession: anotherSession } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
			},
		});

		authUserMap.set(user.id, user);
		passwordResetSessionMap.set(session.id, session);
		passwordResetSessionMap.set(anotherSession.id, anotherSession);

		const result = await resetPasswordUseCase.execute("new_password123", session, user);

		expect(result.isErr).toBe(false);

		expect(passwordResetSessionMap.has(session.id)).toBe(false);
		expect(passwordResetSessionMap.has(anotherSession.id)).toBe(false);
	});

	it("should save user with new password hash", async () => {
		const { passwordResetSession: session } = createPasswordResetSessionFixture({
			passwordResetSession: {
				userId: user.id,
				email: user.email,
				emailVerified: true,
			},
		});

		authUserMap.set(user.id, user);

		const result = await resetPasswordUseCase.execute("new_password123", session, user);

		expect(result.isErr).toBe(false);

		const savedUser = authUserMap.get(user.id);
		expect(savedUser).toBeDefined();
		expect(savedUser?.id).toBe(user.id);

		expect(savedUser?.passwordHash).toBeDefined();
		expect(savedUser?.passwordHash).not.toBe("new_password123");
		if (savedUser?.passwordHash) {
			expect(await passwordHasher.verify("new_password123", savedUser.passwordHash)).toBe(true);
		}
	});
});
