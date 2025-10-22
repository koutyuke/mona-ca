import type { Env } from "../src/shared/infra/config/env";

declare module "cloudflare:test" {
	interface ProvidedEnv extends Env {
		TEST_MIGRATIONS: D1Migration[];
	}
}
