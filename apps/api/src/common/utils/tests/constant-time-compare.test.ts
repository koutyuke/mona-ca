import { describe, expect, test } from "vitest";
import { constantTimeCompare } from "../constant-time-compare";

describe("constantTimeCompare", () => {
	test("should return true when strings are equal", () => {
		expect(constantTimeCompare("hello", "hello")).toBe(true);
		expect(constantTimeCompare("", "")).toBe(true);
		expect(constantTimeCompare("123", "123")).toBe(true);
		expect(constantTimeCompare("あいうえお", "あいうえお")).toBe(true);
	});

	test("should return false when strings are different", () => {
		expect(constantTimeCompare("hello", "world")).toBe(false);
		expect(constantTimeCompare("", "a")).toBe(false);
		expect(constantTimeCompare("123", "456")).toBe(false);
		expect(constantTimeCompare("あいうえお", "かきくけこ")).toBe(false);
	});

	test("should return false when strings have different lengths", () => {
		expect(constantTimeCompare("hello", "hello!")).toBe(false);
		expect(constantTimeCompare("a", "")).toBe(false);
		expect(constantTimeCompare("123", "1234")).toBe(false);
		expect(constantTimeCompare("あいうえお", "あいうえ")).toBe(false);
	});

	test("should be case sensitive", () => {
		expect(constantTimeCompare("hello", "Hello")).toBe(false);
		expect(constantTimeCompare("WORLD", "world")).toBe(false);
	});
});
