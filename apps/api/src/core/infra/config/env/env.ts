import { env as testEnv } from "cloudflare:test";
import { env as productionEnv } from "cloudflare:workers";
import type { CloudflareBindings, Env, EnvVariables } from "./type";
import { validateEnv } from "./validation";

const getEnv = (): {
	env: Readonly<Env>;
	envVariables: Readonly<EnvVariables>;
	cloudflareBindings: Readonly<CloudflareBindings>;
} => {
	const _env = testEnv ? testEnv : productionEnv;

	const { DB, ...appEnvWithoutCFModule } = _env;

	validateEnv(appEnvWithoutCFModule);

	return {
		env: _env,
		envVariables: appEnvWithoutCFModule,
		cloudflareBindings: {
			DB,
		},
	} as const;
};

export const { env, envVariables, cloudflareBindings } = getEnv();
