import {
	type RawAccountAssociationSession,
	type RawAccountLinkSession,
	type RawEmailVerificationSession,
	type RawExternalIdentity,
	type RawPasswordResetSession,
	type RawSession,
	type RawSignupSession,
	type RawUser,
	toRawBoolean,
	toRawDate,
	toRawSessionSecretHash,
} from "../../../../core/testing/helpers";
import type { AccountAssociationSession } from "../../domain/entities/account-association-session";
import type { AccountLinkSession } from "../../domain/entities/account-link-session";
import type { EmailVerificationSession } from "../../domain/entities/email-verification-session";
import type { ExternalIdentity } from "../../domain/entities/external-identity";
import type { PasswordResetSession } from "../../domain/entities/password-reset-session";
import type { Session } from "../../domain/entities/session";
import type { SignupSession } from "../../domain/entities/signup-session";
import type { UserIdentity } from "../../domain/entities/user-identity";
import type { UserRegistration } from "../../domain/entities/user-registration";

export const convertUserIdentityToRaw = (user: UserIdentity, passwordHash: string | null): RawUser => {
	return {
		id: user.id,
		name: "", // UserIdentityには名前情報がないため、空文字列
		email: user.email,
		email_verified: toRawBoolean(user.emailVerified),
		icon_url: null, // UserIdentityにはアイコン情報がないため、null
		gender: "man", // UserIdentityには性別情報がないため、デフォルト値
		password_hash: passwordHash,
		created_at: toRawDate(user.createdAt),
		updated_at: toRawDate(user.updatedAt),
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

export const convertUserRegistrationToIdentity = (userRegistration: UserRegistration): UserIdentity => {
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
		secret_hash: toRawSessionSecretHash(session.secretHash),
		expires_at: toRawDate(session.expiresAt),
	};
};

export const convertExternalIdentityToRaw = (externalIdentity: ExternalIdentity): RawExternalIdentity => {
	return {
		provider: externalIdentity.provider,
		provider_user_id: externalIdentity.providerUserId,
		user_id: externalIdentity.userId,
		linked_at: toRawDate(externalIdentity.linkedAt),
	};
};

export const convertSignupSessionToRaw = (signupSession: SignupSession): RawSignupSession => {
	return {
		id: signupSession.id,
		email: signupSession.email,
		email_verified: toRawBoolean(signupSession.emailVerified),
		code: signupSession.code,
		secret_hash: toRawSessionSecretHash(signupSession.secretHash),
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
		secret_hash: toRawSessionSecretHash(session.secretHash),
		expires_at: toRawDate(session.expiresAt),
	};
};

export const convertPasswordResetSessionToRaw = (session: PasswordResetSession): RawPasswordResetSession => {
	return {
		id: session.id,
		user_id: session.userId,
		code: session.code,
		secret_hash: toRawSessionSecretHash(session.secretHash),
		email: session.email,
		email_verified: toRawBoolean(session.emailVerified),
		expires_at: toRawDate(session.expiresAt),
	};
};

export const convertAccountAssociationSessionToRaw = (
	session: AccountAssociationSession,
): RawAccountAssociationSession => {
	return {
		id: session.id,
		user_id: session.userId,
		code: session.code,
		secret_hash: toRawSessionSecretHash(session.secretHash),
		email: session.email,
		provider: session.provider,
		provider_user_id: session.providerUserId,
		expires_at: toRawDate(session.expiresAt),
	};
};

export const convertAccountLinkSessionToRaw = (session: AccountLinkSession): RawAccountLinkSession => {
	return {
		id: session.id,
		user_id: session.userId,
		secret_hash: toRawSessionSecretHash(session.secretHash),
		expires_at: toRawDate(session.expiresAt),
	};
};
