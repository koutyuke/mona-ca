import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const oauthAccounts = sqliteTable(
	"oauth_accounts",
	{
		provider: text("provider", { enum: ["discord"] }).notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		linkedAt: integer("linked_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
	},
	table => [
		unique("unq_oauth_accounts__provider_account").on(table.provider, table.providerId),
		unique("unq_oauth_accounts__provider_user").on(table.provider, table.userId),
	],
);
