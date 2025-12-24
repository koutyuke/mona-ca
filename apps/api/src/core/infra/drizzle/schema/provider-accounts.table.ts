import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users.table";

export const providerAccountsTable = sqliteTable(
	"provider_accounts",
	{
		provider: text("provider", { enum: ["discord", "google"] }).notNull(),
		providerUserId: text("provider_user_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		linkedAt: integer("linked_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
	},
	table => [
		unique("unq_provider_accounts__provider_account").on(table.provider, table.providerUserId),
		unique("unq_provider_accounts__provider_user").on(table.provider, table.userId),
	],
);
