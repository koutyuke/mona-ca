import { describe, expect, it } from "vitest";
import { generateHMAC, verifyHMAC } from "../hmac";

describe("HmacService", () => {
	const testData = "test data";
	const testSecret = "my secret key";

	describe("generate", () => {
		it("should generate the same HMAC for the same data and secret", () => {
			const hmac1 = generateHMAC(testData, testSecret);
			const hmac2 = generateHMAC(testData, testSecret);
			expect(hmac1).toBe(hmac2);
		});

		it("should generate different HMACs for different data", () => {
			const hmac1 = generateHMAC(testData, testSecret);
			const hmac2 = generateHMAC("different data", testSecret);
			expect(hmac1).not.toBe(hmac2);
		});

		it("should generate different HMACs for different secrets", () => {
			const hmac1 = generateHMAC(testData, testSecret);
			const hmac2 = generateHMAC(testData, "different secret");
			expect(hmac1).not.toBe(hmac2);
		});

		it("should generate HMAC in hexadecimal format", () => {
			const hmac = generateHMAC(testData, testSecret);
			expect(hmac).toMatch(/^[0-9a-f]+$/);
		});
	});

	describe("verify", () => {
		it("should verify successfully with correct data and secret", () => {
			const hmac = generateHMAC(testData, testSecret);
			const isValid = verifyHMAC(testData, testSecret, hmac);
			expect(isValid).toBe(true);
		});

		it("should fail verification with different data", () => {
			const hmac = generateHMAC(testData, testSecret);
			const isValid = verifyHMAC("different data", testSecret, hmac);
			expect(isValid).toBe(false);
		});

		it("should fail verification with different secret", () => {
			const hmac = generateHMAC(testData, testSecret);
			const isValid = verifyHMAC(testData, "different secret", hmac);
			expect(isValid).toBe(false);
		});

		it("should fail verification with invalid HMAC", () => {
			const isValid = verifyHMAC(testData, testSecret, "invalid hmac");
			expect(isValid).toBe(false);
		});
	});
});
