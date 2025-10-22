import { env as productionEnv } from "cloudflare:workers";
import type { CloudflareBindings, Env, EnvVariables } from "./type";
import { validateEnv } from "./validation";

const getEnv = (): {
	env: Readonly<Env>;
	envVariables: Readonly<EnvVariables>;
	cloudflareBindings: Readonly<CloudflareBindings>;
} => {
	const { DB, ...appEnvWithoutCFModule } = productionEnv;

	validateEnv(appEnvWithoutCFModule);

	return {
		env: productionEnv,
		envVariables: appEnvWithoutCFModule,
		cloudflareBindings: {
			DB,
		},
	} as const;
};

export const { env, envVariables, cloudflareBindings } = getEnv();
