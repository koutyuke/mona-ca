import type { Config } from "drizzle-kit";

export default {
	dialect: "sqlite",
	schema: "./src/infrastructure/drizzle/schema/!(index).ts",
	out: "./drizzle/migrations",
	driver: "d1",
	dbCredentials: {
		wranglerConfigPath: "./wrangler.toml",
		dbName: "mona-ca_db",
	},
} as const satisfies Config;
