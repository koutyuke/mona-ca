import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable(
	"users",
	{
		id: text("id").primaryKey().notNull(),
		email: text("email").notNull().unique(),
		emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
		name: text("name").notNull(),
		iconUrl: text("icon_url"),
		gender: text("gender", { enum: ["male", "female"] })
			.default("male")
			.notNull(),
		passwordHash: text("password_hash"),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(strftime('%s', 'now'))`)
			.$onUpdateFn(() => new Date()),
	},
	table => [index("idx_users__email").on(table.email), index("idx_users__updated_at").on(table.updatedAt)],
);
