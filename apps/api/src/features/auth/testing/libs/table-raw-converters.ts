import {
	type RawAccountLinkSession,
	type RawEmailVerificationSession,
	type RawPasswordResetSession,
	type RawProviderAccount,
	type RawProviderConnectionTicket,
	type RawSession,
	type RawSignupSession,
	type RawUser,
	toRawBoolean,
	toRawDate,
	toRawUint8Array,
} from "../../../../core/testing/drivers";
import type { AccountLinkSession } from "../../domain/entities/account-link-session";
import type { EmailVerificationSession } from "../../domain/entities/email-verification-session";
import type { PasswordResetSession } from "../../domain/entities/password-reset-session";
import type { ProviderAccount } from "../../domain/entities/provider-account";
import type { ProviderConnectionTicket } from "../../domain/entities/provider-connection-ticket";
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

export const convertEmailVerificationSessionToRaw = (
	session: EmailVerificationSession,
): RawEmailVerificationSession => {
	return {
		id: session.id,
		email: session.email,
		user_id: session.userId,
		code: session.code,
		secret_hash: toRawUint8Array(session.secretHash),
		expires_at: toRawDate(session.expiresAt),
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

export const convertAccountLinkSessionToRaw = (session: AccountLinkSession): RawAccountLinkSession => {
	return {
		id: session.id,
		user_id: session.userId,
		code: session.code,
		secret_hash: toRawUint8Array(session.secretHash),
		email: session.email,
		provider: session.provider,
		provider_user_id: session.providerUserId,
		expires_at: toRawDate(session.expiresAt),
	};
};

export const convertProviderConnectionTicketToRaw = (ticket: ProviderConnectionTicket): RawProviderConnectionTicket => {
	return {
		id: ticket.id,
		user_id: ticket.userId,
		secret_hash: toRawUint8Array(ticket.secretHash),
		expires_at: toRawDate(ticket.expiresAt),
	};
};
