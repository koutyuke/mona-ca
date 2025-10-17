import { describe, expect, it } from "vitest";
import { decodeBase64URLSafe, encodeBase64URLSafe } from "../base64-url-safe";

describe("Base64 URL Safe Encoding/Decoding", () => {
	describe("encodeBase64UrlSafe", () => {
		it("should encode string to base64 URL safe format", () => {
			const input = "Hello, World!";
			const expected = "SGVsbG8sIFdvcmxkIQ";
			expect(encodeBase64URLSafe(input)).toBe(expected);
		});

		it("should handle special characters", () => {
			const input = "test+test/test=test";
			const expected = "dGVzdCt0ZXN0L3Rlc3Q9dGVzdA";
			expect(encodeBase64URLSafe(input)).toBe(expected);
		});

		it("should handle empty string", () => {
			expect(encodeBase64URLSafe("")).toBe("");
		});
	});

	describe("decodeBase64UrlSafe", () => {
		it("should decode base64 URL safe format to original string", () => {
			const input = "SGVsbG8sIFdvcmxkIQ";
			const expected = "Hello, World!";
			expect(decodeBase64URLSafe(input)).toBe(expected);
		});

		it("should handle special characters", () => {
			const input = "dGVzdCt0ZXN0L3Rlc3Q9dGVzdA";
			const expected = "test+test/test=test";
			expect(decodeBase64URLSafe(input)).toBe(expected);
		});

		it("should handle empty string", () => {
			expect(decodeBase64URLSafe("")).toBe("");
		});

		it("should handle strings with padding", () => {
			const input = "SGVsbG8sIFdvcmxkIQ==";
			const expected = "Hello, World!";
			expect(decodeBase64URLSafe(input)).toBe(expected);
		});
	});

	describe("encode and decode roundtrip", () => {
		it("should correctly encode and decode back to original string", () => {
			const original = "Hello, World! This is a test string.";
			const encoded = encodeBase64URLSafe(original);
			const decoded = decodeBase64URLSafe(encoded);
			expect(decoded).toBe(original);
		});

		it("should handle special characters in roundtrip", () => {
			const original = "test+test/test=test";
			const encoded = encodeBase64URLSafe(original);
			const decoded = decodeBase64URLSafe(encoded);
			expect(decoded).toBe(original);
		});
	});
});
