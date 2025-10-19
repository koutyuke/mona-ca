import type { RawUser } from "../../../../shared/testing/helpers/user-table";
import { toRawBoolean, toRawDate } from "../../../../shared/testing/helpers/utils";
import type { Profile } from "../../domain/entities/profile";

export const convertProfileToRaw = (profile: Profile, passwordHash?: string | null): RawUser => {
	return {
		id: profile.id,
		name: profile.name,
		email: profile.email,
		email_verified: toRawBoolean(profile.emailVerified),
		icon_url: profile.iconUrl,
		gender: profile.gender,
		password_hash: passwordHash ?? null,
		created_at: toRawDate(profile.createdAt),
		updated_at: toRawDate(profile.updatedAt),
	};
};
