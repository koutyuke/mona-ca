import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const userCredentials = sqliteTable("user_credentials", {
	userId: text("user_id")
		.primaryKey()
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	passwordHash: text("password_hash"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(strftime('%s', 'now'))`)
		.$onUpdateFn(() => new Date()),
});
