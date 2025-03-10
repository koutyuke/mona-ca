import { describe, expect, test } from "vitest";
import { err, isErr } from "../result";

describe("isErr", () => {
	test("should return true for an error object", () => {
		const error = err("ERROR_CODE", "Error message");
		expect(isErr(error)).toBe(true);
	});

	test("should return false for null", () => {
		expect(isErr(null)).toBe(false);
	});

	test("should return false for undefined", () => {
		expect(isErr(undefined)).toBe(false);
	});

	test("should return false for a non-error object", () => {
		expect(isErr({})).toBe(false);
	});

	test("should return false for a symbol", () => {
		expect(isErr(Symbol())).toBe(false);
	});

	test("should return false for a Map object", () => {
		expect(isErr(new Map())).toBe(false);
	});

	test("should return false for a function return value", () => {
		expect(isErr((() => {})())).toBe(false);
	});
});
