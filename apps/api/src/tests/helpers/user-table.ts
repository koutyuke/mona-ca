import { ulid } from "../../common/utils";
import type { User } from "../../domain/entities";
import { newGender, newUserId } from "../../domain/value-object";
import { toRawBoolean, toRawDate } from "./utils";

export type RawUser = {
	id: string;
	name: string;
	email: string;
	email_verified: 0 | 1;
	icon_url: string | null;
	gender: "man" | "woman";
	password_hash: string | null;
	created_at: number;
	updated_at: number;
};

export class UserTableHelper {
	constructor(private readonly db: D1Database) {}

	public createData(override?: {
		user?: Partial<User>;
		passwordHash?: string | null;
	}): {
		user: User;
		passwordHash: string | null;
	} {
		const passwordHash = override?.passwordHash ?? "passwordHash";

		return {
			user: {
				id: override?.user?.id ?? newUserId(ulid()),
				name: override?.user?.name ?? "testUser",
				email: override?.user?.email ?? "test.email@example.com",
				emailVerified: override?.user?.emailVerified ?? true,
				iconUrl: override?.user?.iconUrl ?? "http://example.com/icon-url",
				gender: override?.user?.gender ?? newGender("man"),
				createdAt: override?.user?.createdAt ?? new Date(1704067200 * 1000),
				updatedAt: override?.user?.updatedAt ?? new Date(1704067200 * 1000),
			},
			passwordHash,
		};
	}

	public convertToRaw(user: User, passwordHash: string | null): RawUser {
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			email_verified: toRawBoolean(user.emailVerified),
			icon_url: user.iconUrl,
			gender: user.gender,
			password_hash: passwordHash,
			created_at: toRawDate(user.createdAt),
			updated_at: toRawDate(user.updatedAt),
		};
	}

	public async save(user: User, passwordHash: string | null): Promise<void> {
		const { id, name, email, email_verified, icon_url, gender, created_at, updated_at, password_hash } =
			this.convertToRaw(user, passwordHash);

		await this.db
			.prepare(
				"INSERT INTO users (id, name, email, email_verified, icon_url, gender, password_hash, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
			)
			.bind(id, name, email, email_verified, icon_url, gender, password_hash, created_at, updated_at)
			.run();
	}

	public async findById(id: string): Promise<RawUser[]> {
		const { results } = await this.db.prepare("SELECT * FROM users WHERE id = ?1").bind(id).all<RawUser>();

		return results;
	}

	public async deleteAll(): Promise<void> {
		await this.db.prepare("DELETE FROM users").run();
	}
}
