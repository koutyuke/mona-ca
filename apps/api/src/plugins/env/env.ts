import type { FetchHandlerEnv } from "@/types/handlers";
import type { TProperties } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import Elysia, { t, type Static } from "elysia";

const env = <T extends TProperties>(schema: T, env: FetchHandlerEnv) => {
	const { DB, ...otherEnv } = env;

	const validateSchema = t.Object(schema);
	const preparedEnv = Value.Clean(validateSchema, Value.Convert(validateSchema, otherEnv));

	if (!Value.Check(validateSchema, preparedEnv)) {
		console.error("🚨 Invalid environment variables");
		// throw new Error("🚨 Invalid environment variables");
	}

	return new Elysia({
		name: "@mona-ca/elysia-env",
	}).decorate(() => ({
		cfModules: {
			DB,
		},
		env: preparedEnv as Static<typeof validateSchema>,
	}));
};

export { env };
