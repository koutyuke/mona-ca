import { toRawBoolean, toRawDate } from "../../../../core/testing/drivers/utils";

import type { RawUser } from "../../../../core/testing/drivers/users.table.driver";
import type { UserProfile } from "../../domain/entities/user-profile";

export const convertUserProfileToRaw = (userProfile: UserProfile, passwordHash?: string | null): RawUser => {
	return {
		id: userProfile.id,
		name: userProfile.name,
		email: userProfile.email,
		email_verified: toRawBoolean(userProfile.emailVerified),
		icon_url: userProfile.iconUrl,
		gender: userProfile.gender,
		password_hash: passwordHash ?? null,
		created_at: toRawDate(userProfile.createdAt),
		updated_at: toRawDate(userProfile.updatedAt),
	};
};
