import { index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const accountAssociationSessions = sqliteTable(
	"account_association_sessions",
	{
		id: text("id").primaryKey().notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		code: text("code").notNull(),
		email: text("email").notNull(),
		emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
		provider: text("provider", { enum: ["discord"] }).notNull(),
		providerId: text("provider_id").notNull(),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	table => {
		return {
			expiresAtIdx: index("idx_account_association_sessions__expires_at").on(table.expiresAt),
			uniqueProviderUser: unique("unq_account_association_sessions__provider_user").on(table.provider, table.userId),
		};
	},
);
