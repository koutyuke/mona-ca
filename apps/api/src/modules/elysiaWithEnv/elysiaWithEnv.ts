import { InternalServerErrorException } from "@/plugins/error/exceptions";
import type { FetchHandlerEnv } from "@/types/handlers";
import { Value } from "@sinclair/typebox/value";
import { Elysia, type ElysiaConfig, t } from "elysia";

type CustomSingleton = {
	decorator: {
		env: Omit<FetchHandlerEnv, "DB">;
		cfModuleEnv: Pick<FetchHandlerEnv, "DB">;
	};
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	store: {};
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	derive: {};
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	resolve: {};
};

const validateEnvSchema = t.Object({
	APP_ENV: t.Union([t.Literal("development"), t.Literal("production")]),
});

class ElysiaWithEnv<const BasePath extends string = "", const Scoped extends boolean = false> extends Elysia<
	BasePath,
	Scoped,
	CustomSingleton
> {
	constructor(config?: ElysiaConfig<BasePath, Scoped>) {
		super(config);
	}

	setEnv(env: FetchHandlerEnv) {
		const { DB, ...otherEnv } = env;

		const preparedEnv = Value.Clean(validateEnvSchema, Value.Convert(validateEnvSchema, otherEnv));

		if (!Value.Check(validateEnvSchema, preparedEnv)) {
			console.error("🚨 Invalid environment variables");
			throw new InternalServerErrorException();
		}

		this.decorate("env", preparedEnv satisfies CustomSingleton["decorator"]["env"]).decorate("cfModuleEnv", {
			DB,
		} satisfies CustomSingleton["decorator"]["cfModuleEnv"]);

		return this;
	}
}

export { ElysiaWithEnv };
