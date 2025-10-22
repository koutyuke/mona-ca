import { describe, expect, test } from "vitest";
import { timingSafeStringEqual } from "./timing-safe-string-equal";

describe("constantTimeCompare", () => {
	test("should return true when strings are equal", () => {
		expect(timingSafeStringEqual("hello", "hello")).toBe(true);
		expect(timingSafeStringEqual("", "")).toBe(true);
		expect(timingSafeStringEqual("123", "123")).toBe(true);
		expect(timingSafeStringEqual("あいうえお", "あいうえお")).toBe(true);
	});

	test("should return false when strings are different", () => {
		expect(timingSafeStringEqual("hello", "world")).toBe(false);
		expect(timingSafeStringEqual("", "a")).toBe(false);
		expect(timingSafeStringEqual("123", "456")).toBe(false);
		expect(timingSafeStringEqual("あいうえお", "かきくけこ")).toBe(false);
	});

	test("should return false when strings have different lengths", () => {
		expect(timingSafeStringEqual("hello", "hello!")).toBe(false);
		expect(timingSafeStringEqual("a", "")).toBe(false);
		expect(timingSafeStringEqual("123", "1234")).toBe(false);
		expect(timingSafeStringEqual("あいうえお", "あいうえ")).toBe(false);
	});

	test("should be case sensitive", () => {
		expect(timingSafeStringEqual("hello", "Hello")).toBe(false);
		expect(timingSafeStringEqual("WORLD", "world")).toBe(false);
	});
});
