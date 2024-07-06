import { env } from "cloudflare:test";
import { Value } from "@sinclair/typebox/value";
import { beforeAll, describe, expect, test } from "vitest";
import { AppEnvWithoutCFModuleEnvSchema } from "../env";
import { ElysiaWithEnv } from "./elysiaWithEnv";

describe("ElysiaWithEnv Unit Test", () => {
	const { DB } = env;

	describe("Set Environment", () => {
		const elysiaWithEnv = new ElysiaWithEnv({
			aot: false,
		});

		beforeAll(() => {
			elysiaWithEnv.setEnv(env);
		});

		test("Environment is set correctly", () => {
			expect(Value.Check(AppEnvWithoutCFModuleEnvSchema, elysiaWithEnv.decorator.env)).toBe(true);
			expect(elysiaWithEnv.decorator.cfModuleEnv).toEqual({
				DB,
			});
		});
	});
});
