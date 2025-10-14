import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const externalIdentities = sqliteTable(
	"external_identities",
	{
		provider: text("provider", { enum: ["discord", "google"] }).notNull(),
		providerUserId: text("provider_user_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		linkedAt: integer("linked_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
	},
	table => [
		unique("unq_external_identities__provider_account").on(table.provider, table.providerUserId),
		unique("unq_external_identities__provider_user").on(table.provider, table.userId),
	],
);
