import { env } from "cloudflare:test";
import { Value } from "@sinclair/typebox/value";
import { beforeAll, describe, expect, test } from "vitest";
import { AppEnvWithoutCFModuleEnvSchema } from "../../env";
import { ElysiaWithEnv } from "../elysia-with-env";

const { DB } = env;

describe("Set Environment", () => {
	const elysiaWithEnv = new ElysiaWithEnv({
		aot: false,
	});

	beforeAll(() => {
		elysiaWithEnv.setEnv(env);
	});

	test("Environment is set correctly", () => {
		expect(Value.Check(AppEnvWithoutCFModuleEnvSchema, elysiaWithEnv.decorator.env)).toBeTruthy();
		expect(elysiaWithEnv.decorator.cfModuleEnv).toEqual({
			DB,
		});
	});
});
