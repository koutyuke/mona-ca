import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({ path: ".env.drizzle.local" });

if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
	throw new Error("env var not set");
}

export default {
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
		databaseId: "b7773705-8f1f-49e2-9a42-564971632cf4",
		token: process.env.CLOUDFLARE_API_TOKEN!,
	},
} as const satisfies Config;
