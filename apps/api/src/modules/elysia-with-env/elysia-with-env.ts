import { InternalServerErrorException } from "@/modules/error/exceptions";
import { Value } from "@sinclair/typebox/value";
import { Elysia, type ElysiaConfig } from "elysia";
import { type AppEnv, type AppEnvWithoutCFModuleEnv, AppEnvWithoutCFModuleEnvSchema, type CFModuleEnv } from "../env";

type CustomSingleton = {
	decorator: {
		env: AppEnvWithoutCFModuleEnv;
		cfModuleEnv: CFModuleEnv;
	};
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	store: {};
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	derive: {};
	// biome-ignore lint/complexity/noBannedTypes: <explanation>
	resolve: {};
};

class ElysiaWithEnv<const BasePath extends string = "", const Scoped extends boolean = false> extends Elysia<
	BasePath,
	Scoped,
	CustomSingleton
> {
	constructor(config?: ElysiaConfig<BasePath, Scoped>) {
		super(config);
	}

	public setEnv(env: AppEnv): this {
		const { DB, ...otherEnv } = env;

		const preparedEnv = Value.Clean(
			AppEnvWithoutCFModuleEnvSchema,
			Value.Convert(AppEnvWithoutCFModuleEnvSchema, otherEnv),
		);

		if (!Value.Check(AppEnvWithoutCFModuleEnvSchema, preparedEnv)) {
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
