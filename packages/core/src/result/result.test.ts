import { describe, expect, test } from "bun:test";
import { err, ok } from "./result";

describe("result", () => {
	test("okが成功状態を返す", () => {
		const value = { message: "success" };
		const result = ok(value);
		const statusSymbols = Object.getOwnPropertySymbols(result);
		const statusSymbol = statusSymbols[0]!;

		expect(result.isOk).toBe(true);
		expect(result.isErr).toBe(false);
		expect(result.value).toBe(value);

		expect(statusSymbol?.description).toBe("ResultType");
		// @ts-expect-error
		expect(result[statusSymbol]).toBe("ok");
	});

	test("okで値を渡さない場合undefinedになる", () => {
		const result = ok();
		const statusSymbols = Object.getOwnPropertySymbols(result);
		const statusSymbol = statusSymbols[0]!;

		expect(result.value).toBeUndefined();
		// @ts-expect-error
		expect(result[statusSymbol]).toBe("ok");
	});

	test("errが失敗状態を返す", () => {
		const context = { reason: "invalid" };
		const result = err("UNKNOWN_ERROR", context);
		const statusSymbols = Object.getOwnPropertySymbols(result);
		const statusSymbol = statusSymbols[0]!;

		expect(result.isOk).toBe(false);
		expect(result.isErr).toBe(true);
		expect(result.code).toBe("UNKNOWN_ERROR");
		expect(result.context).toBe(context);
		expect(statusSymbol.description).toBe("ResultType");
		// @ts-expect-error
		expect(result[statusSymbol]).toBe("err");
	});

	test("errのcontextがデフォルトで新しいオブジェクトになる", () => {
		const first = err("FIRST_ERROR");
		const second = err("SECOND_ERROR");

		expect(first.context).toEqual({});
		expect(second.context).toEqual({});
		expect(first.context).not.toBe(second.context);
	});
});
