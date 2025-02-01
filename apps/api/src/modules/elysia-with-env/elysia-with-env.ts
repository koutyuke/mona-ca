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

/**
 * ElysiaWithEnv is a class that extends the Elysia class with additional environment configuration capabilities.
 *
 * @template BasePath - The base path for the Elysia instance. Defaults to an empty string.
 * @template Scoped - A boolean indicating whether the instance is scoped. Defaults to false.
 *
 * @extends Elysia<BasePath, CustomSingleton>
 */
export class ElysiaWithEnv<const BasePath extends string = ""> extends Elysia<BasePath, CustomSingleton> {
	/**
	 * Constructs an instance of ElysiaWithEnv.
	 *
	 * @param {ElysiaConfig<BasePath>} [config] - Optional configuration object for the Elysia instance.
	 */
	constructor(config?: ElysiaConfig<BasePath>) {
		super(config);
	}

	/**
	 * Sets the environment variables for the Elysia instance.
	 *
	 * @param {AppEnv} env - The environment variables to set.
	 * @returns {this} The current instance of ElysiaWithEnv.
	 *
	 * @throws {Error} Throws an error if the environment variables are invalid.
	 */
	public setEnv(env: AppEnv): this {
		const { DB, ...otherEnv } = env;

		const preparedEnv = Value.Clean(
			AppEnvWithoutCFModuleEnvSchema,
			Value.Convert(AppEnvWithoutCFModuleEnvSchema, otherEnv),
		);

		if (!Value.Check(AppEnvWithoutCFModuleEnvSchema, preparedEnv)) {
			console.error("🚨 Invalid environment variables");
			throw new Error("🚨 Invalid environment variables");
		}

		this.decorate("env", preparedEnv satisfies CustomSingleton["decorator"]["env"]).decorate("cfModuleEnv", {
			DB,
		} satisfies CustomSingleton["decorator"]["cfModuleEnv"]);

		return this;
	}
}
