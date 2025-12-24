import { blob, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { usersTable } from "./users.table";

export const providerLinkRequestsTable = sqliteTable(
	"provider_link_requests",
	{
		id: text("id").primaryKey().notNull(),
		userId: text("user_id")
			.unique()
			.notNull()
			.references(() => usersTable.id, { onDelete: "cascade" }),
		provider: text("provider", { enum: ["discord", "google"] }).notNull(),
		secretHash: blob("secret_hash", { mode: "buffer" }).notNull(),
		expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	},
	table => [index("idx_provider_link_requests__expires_at").on(table.expiresAt)],
);
