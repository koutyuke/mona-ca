import { relations } from "drizzle-orm";
import { oAuthAccounts } from "./oauth-accounts";
import { passwordResetTokens } from "./password-reset-tokens";
import { session } from "./session";
import { users } from "./users";

export const userRelations = relations(users, ({ many }) => ({
	sessions: many(session),
	passwordResetTokens: many(passwordResetTokens),
	oAuthAccounts: many(oAuthAccounts),
}));
