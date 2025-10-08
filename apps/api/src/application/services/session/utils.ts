import type {
	AccountAssociationSessionId,
	EmailVerificationSessionId,
	PasswordResetSessionId,
	SessionId,
	SignupSessionId,
} from "../../../domain/value-object";

export type SessionIds =
	| SessionId
	| EmailVerificationSessionId
	| PasswordResetSessionId
	| AccountAssociationSessionId
	| SignupSessionId;

export const separateSessionTokenToIdAndSecret = <T extends SessionIds>(
	token: string,
): { id: T; secret: string } | null => {
	const [id, secret] = token.split(".");
	if (!id || !secret) {
		return null;
	}
	return { id: id as T, secret };
};

export const createSessionToken = (id: SessionIds, secret: string): string => {
	return `${id}.${secret}`;
};
