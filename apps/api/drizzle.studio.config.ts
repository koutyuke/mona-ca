import type { Config } from "drizzle-kit";

if (!process.env.LOCAL_DB_PATH) {
	throw new Error("LOCAL_DB_PATH env var not set");
}

export default {
	dialect: "sqlite",
	dbCredentials: {
		url: process.env.LOCAL_DB_PATH,
	},
} satisfies Config;
