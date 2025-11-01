import type { AccountAssociationSession } from "../../domain/entities/account-association-session";

export const toAccountAssociationPreviewResponse = (
	accountAssociationSession: AccountAssociationSession,
): {
	provider: "discord" | "google";
	providerId: string;
} => {
	return {
		provider: accountAssociationSession.provider,
		providerId: accountAssociationSession.providerUserId,
	};
};
