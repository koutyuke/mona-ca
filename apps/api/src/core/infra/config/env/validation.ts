import { Value } from "@sinclair/typebox/value";
import { EnvVariablesSchema } from "./schema";
import type { EnvVariables } from "./type";

export const validateEnv = (envVariables: EnvVariables) => {
	const preparedEnv = Value.Clean(EnvVariablesSchema, Value.Convert(EnvVariablesSchema, envVariables));

	if (!Value.Check(EnvVariablesSchema, preparedEnv)) {
		console.error("🚨 Invalid environment variables");
		throw new Error("🚨 Invalid environment variables");
	}
};
