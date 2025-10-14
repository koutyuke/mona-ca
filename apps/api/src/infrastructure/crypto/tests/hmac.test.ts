import { describe, expect, it } from "vitest";
import { HmacSha256 } from "../hmac-sha-256";

const SECRET = "test-secret-key";
const MESSAGE = "test-message";

describe("HmacSha256", () => {
	it("generates the same signature for identical inputs", () => {
		const mac = new HmacSha256(SECRET);
		const signature1 = mac.sign(MESSAGE);
		const signature2 = mac.sign(MESSAGE);

		expect(signature1).toBe(signature2);
	});

	it("generates different signatures when plaintext changes", () => {
		const mac = new HmacSha256(SECRET);
		const signature1 = mac.sign(MESSAGE);
		const signature2 = mac.sign("different-message");

		expect(signature1).not.toBe(signature2);
	});

	it("supports alternate encodings", () => {
		const mac = new HmacSha256(SECRET);
		const base64Signature = mac.sign(MESSAGE, { encoding: "base64" });

		expect(base64Signature).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
	});

	describe("verify", () => {
		it("returns true for a matching signature", () => {
			const mac = new HmacSha256(SECRET);
			const signature = mac.sign(MESSAGE);

			expect(mac.verify(MESSAGE, signature)).toBe(true);
		});

		it("returns true for matching signature with custom encoding", () => {
			const mac = new HmacSha256(SECRET);
			const opts = { encoding: "base64" as const };
			const signature = mac.sign(MESSAGE, opts);

			expect(mac.verify(MESSAGE, signature, opts)).toBe(true);
		});

		it("returns false when signatures do not match", () => {
			const mac = new HmacSha256(SECRET);
			const signature = mac.sign(MESSAGE);
			const tamperedSignature = `${signature.slice(0, -1)}${signature.slice(-1) === "a" ? "b" : "a"}`;

			expect(mac.verify(MESSAGE, tamperedSignature)).toBe(false);
		});

		it("returns false when encoding does not match", () => {
			const mac = new HmacSha256(SECRET);
			const signature = mac.sign(MESSAGE);

			expect(mac.verify(MESSAGE, signature, { encoding: "base64" })).toBe(false);
		});

		it("returns false when plaintext differs", () => {
			const mac = new HmacSha256(SECRET);
			const signature = mac.sign(MESSAGE);

			expect(mac.verify("another-message", signature)).toBe(false);
		});
	});
});
