import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
	"users",
	{
		id: text("id").primaryKey().notNull(),
		email: text("email").notNull().unique(),
		emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
		name: text("name").notNull(),
		iconUrl: text("icon_url"),
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

export const userRelations = relations(users, ({ many }) => ({
	sessions: many(session),
	passwordResetTokens: many(passwordResetTokens),
	oAuthAccounts: many(oAuthAccounts),
}));

export const oAuthAccounts = sqliteTable(
	"oauth_accounts",
	{
		provider: text("provider", { enum: ["discord"] }).notNull(),
		providerId: text("provider_id").notNull().unique(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.default(sql`(strftime('%s', 'now'))`)
			.$onUpdateFn(() => new Date()),
	},
	table => {
		return {
			uniqueProviderAccount: unique("unique_oauth_accounts_provider_account").on(table.provider, table.providerId),
			uniqueProviderUser: unique("unique_oauth_accounts_provider_user").on(table.provider, table.userId),
			updatedAtIndex: index("idx_oauth_accounts_updated_at").on(table.updatedAt),
		};
	},
);

export const session = sqliteTable(
	"session",
	{
		id: text("id").primaryKey().notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	table => {
		return {
			expiresAtIdx: index("idx_session_expires_at").on(table.expiresAt),
		};
	},
);

export const passwordResetTokens = sqliteTable(
	"password_reset_tokens",
	{
		id: text("id").primaryKey().notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		hashedToken: text("hashed_token").notNull().unique(),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	table => {
		return {
			hashedTokenIdx: index("idx_password_reset_token_hashed_token").on(table.hashedToken),
			expiresAtIdx: index("idx_password_reset_token_expires_at").on(table.expiresAt),
		};
	},
);
