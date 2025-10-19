import { beforeEach, describe, expect, it } from "vitest";
import { PasswordHasherMock, SessionSecretHasherMock } from "../../../../../../shared/testing/mocks/system";
import { createAuthUserFixture, createSessionFixture } from "../../../../testing/fixtures";
import {
	AuthUserRepositoryMock,
	SessionRepositoryMock,
	createAuthUserMap,
	createSessionsMap,
} from "../../../../testing/mocks/repositories";
import { UpdateUserPasswordUseCase } from "../update-user-password.usecase";

const sessionMap = createSessionsMap();
const authUserMap = createAuthUserMap();

const sessionRepository = new SessionRepositoryMock({
	sessionMap,
});
const authUserRepository = new AuthUserRepositoryMock({
	authUserMap,
	sessionMap,
});
const passwordHasher = new PasswordHasherMock();
const sessionSecretHasher = new SessionSecretHasherMock();

const updateUserPasswordUseCase = new UpdateUserPasswordUseCase(
	authUserRepository,
	sessionRepository,
	passwordHasher,
	sessionSecretHasher,
);

const { userRegistration, userIdentity } = createAuthUserFixture({
	userRegistration: {
		passwordHash: null,
	},
});

describe("UpdateUserPasswordUseCase", () => {
	beforeEach(() => {
		sessionMap.clear();
		authUserMap.clear();
	});

	it("should update password successfully when no existing password and no current password provided", async () => {
		authUserMap.set(userRegistration.id, userRegistration);
		const newPassword = "new_password123";
		const result = await updateUserPasswordUseCase.execute(userIdentity, null, newPassword);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session, sessionToken } = result.value;
			expect(session.userId).toBe(userRegistration.id);
			expect(typeof sessionToken).toBe("string");
			expect(sessionToken.length).toBeGreaterThan(0);
		}

		const savedUser = authUserMap.get(userRegistration.id);
		expect(savedUser?.passwordHash).toBeDefined();
		expect(savedUser?.passwordHash).not.toBe(newPassword);
		if (savedUser?.passwordHash) {
			expect(await passwordHasher.verify(newPassword, savedUser.passwordHash)).toBe(true);
		}
	});

	it("should return INVALID_CURRENT_PASSWORD error when no existing password but current password provided", async () => {
		authUserMap.set(userRegistration.id, userRegistration);
		const result = await updateUserPasswordUseCase.execute(userIdentity, "wrong_password", "new_password123");

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("INVALID_CURRENT_PASSWORD");
		}
	});

	it("should return INVALID_CURRENT_PASSWORD error when existing password but no current password provided", async () => {
		const userWithPassword = { ...userRegistration, passwordHash: "existing_hash" };
		const userIdentityWithPassword = { ...userIdentity, passwordHash: "existing_hash" };
		authUserMap.set(userWithPassword.id, userWithPassword);

		const result = await updateUserPasswordUseCase.execute(userIdentityWithPassword, null, "new_password123");

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("INVALID_CURRENT_PASSWORD");
		}
	});

	it("should return INVALID_CURRENT_PASSWORD error when current password is incorrect", async () => {
		const existingPassword = "existing_password";
		const existingPasswordHash = await passwordHasher.hash(existingPassword);
		const userWithPassword = { ...userRegistration, passwordHash: existingPasswordHash };
		const userIdentityWithPassword = { ...userIdentity, passwordHash: existingPasswordHash };
		authUserMap.set(userWithPassword.id, userWithPassword);

		const result = await updateUserPasswordUseCase.execute(
			userIdentityWithPassword,
			"wrong_password",
			"new_password123",
		);

		expect(result.isErr).toBe(true);

		if (result.isErr) {
			expect(result.code).toBe("INVALID_CURRENT_PASSWORD");
		}
	});

	it("should update password successfully when current password is correct", async () => {
		const existingPassword = "existing_password";
		const existingPasswordHash = await passwordHasher.hash(existingPassword);
		const userWithPassword = { ...userRegistration, passwordHash: existingPasswordHash };
		const userIdentityWithPassword = { ...userIdentity, passwordHash: existingPasswordHash };
		authUserMap.set(userWithPassword.id, userWithPassword);

		const newPassword = "new_password123";
		const result = await updateUserPasswordUseCase.execute(userIdentityWithPassword, existingPassword, newPassword);

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session, sessionToken } = result.value;
			expect(session.userId).toBe(userWithPassword.id);
			expect(typeof sessionToken).toBe("string");
			expect(sessionToken.length).toBeGreaterThan(0);
		}

		const savedUser = authUserMap.get(userWithPassword.id);
		expect(savedUser?.passwordHash).toBeDefined();
		expect(savedUser?.passwordHash).not.toBe(newPassword);
		expect(savedUser?.passwordHash).not.toBe(existingPasswordHash);
		if (savedUser?.passwordHash) {
			expect(await passwordHasher.verify(newPassword, savedUser.passwordHash)).toBe(true);
		}
	});

	it("should delete all user sessions when password is updated", async () => {
		authUserMap.set(userRegistration.id, userRegistration);
		const { session: session1 } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});
		const { session: session2 } = createSessionFixture({
			session: {
				userId: userRegistration.id,
			},
		});

		sessionMap.set(session1.id, session1);
		sessionMap.set(session2.id, session2);

		const result = await updateUserPasswordUseCase.execute(userIdentity, null, "new_password123");

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session } = result.value;
			expect(sessionMap.has(session1.id)).toBe(false);
			expect(sessionMap.has(session2.id)).toBe(false);
			expect(sessionMap.size).toBe(1);
			expect(sessionMap.get(session.id)).toBeDefined();
		}
	});

	it("should create and save new session after password update", async () => {
		authUserMap.set(userRegistration.id, userRegistration);
		const result = await updateUserPasswordUseCase.execute(userIdentity, null, "new_password123");

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { session } = result.value;
			const savedSession = sessionMap.get(session.id);
			expect(savedSession).toBeDefined();
			expect(savedSession?.userId).toBe(userRegistration.id);
			expect(savedSession?.id).toBe(session.id);
		}
	});

	it("should generate session token with correct format", async () => {
		authUserMap.set(userRegistration.id, userRegistration);
		const result = await updateUserPasswordUseCase.execute(userIdentity, null, "new_password123");

		expect(result.isErr).toBe(false);

		if (!result.isErr) {
			const { sessionToken } = result.value;
			expect(typeof sessionToken).toBe("string");
			expect(sessionToken.length).toBeGreaterThan(0);
			expect(sessionToken.split(".").length).toBe(2);
		}
	});

	it("should save user with new password hash", async () => {
		authUserMap.set(userRegistration.id, userRegistration);
		const result = await updateUserPasswordUseCase.execute(userIdentity, null, "new_password123");

		expect(result.isErr).toBe(false);

		const savedUser = authUserMap.get(userRegistration.id);
		expect(savedUser).toBeDefined();
		expect(savedUser?.id).toBe(userRegistration.id);
		expect(savedUser?.email).toBe(userRegistration.email);

		expect(savedUser?.passwordHash).toBeDefined();
		expect(savedUser?.passwordHash).not.toBe("new_password123");
		if (savedUser?.passwordHash) {
			expect(await passwordHasher.verify("new_password123", savedUser.passwordHash)).toBe(true);
		}
	});
});
