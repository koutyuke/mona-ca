import path from "node:path";
import { defineWorkersConfig, readD1Migrations } from "@cloudflare/vitest-pool-workers/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineWorkersConfig(async () => {
	const migrationsPath = path.join(__dirname, "drizzle/migrations");
	const migrations = await readD1Migrations(migrationsPath);

	return {
		plugins: [tsconfigPaths()],
		resolve: {},
		test: {
			globals: true,
			setupFiles: ["./tests/apply-migrations.ts"],
			include: ["**/*.test.ts"],
			exclude: ["src/server.ts"],
			poolOptions: {
				workers: {
					singleWorker: true,
					wrangler: {
						configPath: "./wrangler.jsonc",
						environment: "test",
					},
					miniflare: {
						bindings: { TEST_MIGRATIONS: migrations },
					},
				},
			},
		},
	};
});
