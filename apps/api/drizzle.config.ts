import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.drizzle.local" });

export default defineConfig({
	out: "./drizzle/migrations",
	schema: "./src/core/infra/drizzle/schema/!(index).ts",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
		databaseId: "b7773705-8f1f-49e2-9a42-564971632cf4",
		token: process.env.CLOUDFLARE_API_TOKEN!,
	},
});
