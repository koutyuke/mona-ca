import { Value } from "@sinclair/typebox/value";
import { AppEnvWithoutCFModuleSchema } from "./schema";
import type { AppEnv } from "./type";

export const validateEnv = (env: AppEnv) => {
	const { DB, ...otherEnv } = env;

	const preparedEnv = Value.Clean(AppEnvWithoutCFModuleSchema, Value.Convert(AppEnvWithoutCFModuleSchema, otherEnv));

	if (!Value.Check(AppEnvWithoutCFModuleSchema, preparedEnv)) {
		console.error("🚨 Invalid environment variables");
		throw new Error("🚨 Invalid environment variables");
	}
};
