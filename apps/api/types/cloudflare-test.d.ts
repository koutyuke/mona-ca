import type { AppEnv } from "../src/common/infra/config/env";

declare module "cloudflare:test" {
	interface ProvidedEnv extends AppEnv {
		TEST_MIGRATIONS: D1Migration[];
	}
}
