import type { User, UserDto } from "../model/user";

export const convertToUser = (data: UserDto): User => {
	return {
		id: data.id,
		email: data.email,
		emailVerified: data.emailVerified,
		name: data.name,
		iconUrl: data.iconUrl,
		gender: data.gender,
		createdAt: new Date(data.createdAt),
		updatedAt: new Date(data.updatedAt),
	};
};
