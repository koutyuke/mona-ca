import type { AppEnv } from "../src/modules/env";

declare module "cloudflare:test" {
	interface ProvidedEnv extends AppEnv {
		TEST_MIGRATIONS: D1Migration[];
	}
}
