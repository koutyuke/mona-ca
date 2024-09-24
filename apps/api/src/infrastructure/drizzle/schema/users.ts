import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
	"users",
	{
		id: text("id").primaryKey().notNull(),
		email: text("email").notNull().unique(),
		emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
		name: text("name").notNull(),
		iconUrl: text("icon_url"),
		gender: text("gender", { enum: ["man", "woman"] })
			.default("man")
			.notNull(),
		hashedPassword: text("hashed_password"),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(strftime('%s', 'now'))`)
			.$onUpdateFn(() => new Date()),
	},
	table => {
		return {
			emailIdx: index("idx_users_email").on(table.email),
			updatedAtIdx: index("idx_users_updated_at").on(table.updatedAt),
		};
	},
);
