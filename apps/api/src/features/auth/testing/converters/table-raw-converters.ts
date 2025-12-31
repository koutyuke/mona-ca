import { toRawBoolean, toRawDate, toRawUint8Array } from "../../../../core/testing/drivers";

import type {
	RawAccountLinkRequest,
	RawEmailVerificationRequest,
	RawPasswordResetSession,
	RawProviderAccount,
	RawProviderLinkRequest,
	RawSession,
	RawSignupSession,
	RawUser,
} from "../../../../core/testing/drivers";
import type { AccountLinkRequest } from "../../domain/entities/account-link-request";
import type { EmailVerificationRequest } from "../../domain/entities/email-verification-request";
import type { PasswordResetSession } from "../../domain/entities/password-reset-session";
import type { ProviderAccount } from "../../domain/entities/provider-account";
import type { ProviderLinkRequest } from "../../domain/entities/provider-link-request";
import type { Session } from "../../domain/entities/session";
import type { SignupSession } from "../../domain/entities/signup-session";
import type { UserCredentials } from "../../domain/entities/user-credentials";
import type { UserRegistration } from "../../domain/entities/user-registration";

export const convertUserCredentialsToRaw = (userCredentials: UserCredentials, passwordHash: string | null): RawUser => {
	return {
		id: userCredentials.id,
		name: "", // UserCredentialsには名前情報がないため、空文字列
		email: userCredentials.email,
		email_verified: toRawBoolean(userCredentials.emailVerified),
		icon_url: null, // UserCredentialsにはアイコン情報がないため、null
		gender: "male", // UserCredentialsには性別情報がないため、デフォルト値
		password_hash: passwordHash,
		created_at: toRawDate(userCredentials.createdAt),
		updated_at: toRawDate(userCredentials.updatedAt),
	};
};

export const convertUserRegistrationToRaw = (userRegistration: UserRegistration): RawUser => {
	return {
		id: userRegistration.id,
		email: userRegistration.email,
		email_verified: toRawBoolean(userRegistration.emailVerified),
		password_hash: userRegistration.passwordHash,
		name: userRegistration.name,
		icon_url: userRegistration.iconUrl,
		gender: userRegistration.gender,
		created_at: toRawDate(userRegistration.createdAt),
		updated_at: toRawDate(userRegistration.updatedAt),
	};
};

export const convertUserRegistrationToUserCredentials = (userRegistration: UserRegistration): UserCredentials => {
	return {
		id: userRegistration.id,
		email: userRegistration.email,
		emailVerified: userRegistration.emailVerified,
		passwordHash: userRegistration.passwordHash,
		createdAt: userRegistration.createdAt,
		updatedAt: userRegistration.updatedAt,
	};
};

export const convertSessionToRaw = (session: Session): RawSession => {
	return {
		id: session.id,
		user_id: session.userId,
		secret_hash: toRawUint8Array(session.secretHash),
		expires_at: toRawDate(session.expiresAt),
	};
};

export const convertProviderAccountToRaw = (providerAccount: ProviderAccount): RawProviderAccount => {
	return {
		provider: providerAccount.provider,
		provider_user_id: providerAccount.providerUserId,
		user_id: providerAccount.userId,
		linked_at: toRawDate(providerAccount.linkedAt),
	};
};

export const convertSignupSessionToRaw = (signupSession: SignupSession): RawSignupSession => {
	return {
		id: signupSession.id,
		email: signupSession.email,
		email_verified: toRawBoolean(signupSession.emailVerified),
		code: signupSession.code,
		secret_hash: toRawUint8Array(signupSession.secretHash),
		expires_at: toRawDate(signupSession.expiresAt),
	};
};

export const convertEmailVerificationRequestToRaw = (
	request: EmailVerificationRequest,
): RawEmailVerificationRequest => {
	return {
		id: request.id,
		email: request.email,
		user_id: request.userId,
		code: request.code,
		secret_hash: toRawUint8Array(request.secretHash),
		expires_at: toRawDate(request.expiresAt),
	};
};

export const convertPasswordResetSessionToRaw = (session: PasswordResetSession): RawPasswordResetSession => {
	return {
		id: session.id,
		user_id: session.userId,
		code: session.code,
		secret_hash: toRawUint8Array(session.secretHash),
		email: session.email,
		email_verified: toRawBoolean(session.emailVerified),
		expires_at: toRawDate(session.expiresAt),
	};
};

export const convertAccountLinkRequestToRaw = (request: AccountLinkRequest): RawAccountLinkRequest => {
	return {
		id: request.id,
		user_id: request.userId,
		code: request.code,
		secret_hash: toRawUint8Array(request.secretHash),
		email: request.email,
		provider: request.provider,
		provider_user_id: request.providerUserId,
		expires_at: toRawDate(request.expiresAt),
	};
};

export const convertProviderLinkRequestToRaw = (request: ProviderLinkRequest): RawProviderLinkRequest => {
	return {
		id: request.id,
		user_id: request.userId,
		provider: request.provider,
		secret_hash: toRawUint8Array(request.secretHash),
		expires_at: toRawDate(request.expiresAt),
	};
};
