import type { AppEnv } from "../src/plugins/env";

declare module "cloudflare:test" {
	interface ProvidedEnv extends AppEnv {
		TEST_MIGRATIONS: D1Migration[];
	}
}
