import { env as envPlugin } from "@/plugins/env";
import { error } from "@/plugins/error";
import { logger } from "@/plugins/logger";
import type { FetchHandlerEnv } from "@/types/handlers";
import { Elysia, type ElysiaConfig } from "elysia";

const baseElysia = <const BasePath extends string = "", const Scoped extends boolean = false>(
	env: FetchHandlerEnv,
	config?: ElysiaConfig<BasePath, Scoped>,
) => new Elysia(config).use(envPlugin({}, env)).use(logger).use(error);

const createEmptyBaseInstance = (config?: Parameters<typeof baseElysia>[1]) =>
	new Elysia(config) as ReturnType<typeof baseElysia>;

export { baseElysia, createEmptyBaseInstance };
