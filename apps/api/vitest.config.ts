import path from "node:path";
import { defineWorkersConfig, readD1Migrations } from "@cloudflare/vitest-pool-workers/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineWorkersConfig(async () => {
	const migrationsPath = path.join(__dirname, "drizzle/migrations");
	const migrations = await readD1Migrations(migrationsPath);

	return {
		plugins: [tsconfigPaths()],
		resolve: {
			alias: {
				"cloudflare:workers": "cloudflare:test",
			},
		},
		test: {
			globals: true,
			setupFiles: ["./tests/apply-migrations.ts"],
			include: ["**/*.test.ts"],
			exclude: ["src/routes/index.ts"],
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
