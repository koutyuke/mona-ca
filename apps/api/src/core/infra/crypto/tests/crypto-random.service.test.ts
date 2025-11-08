import { describe, expect, it } from "vitest";
import { CryptoRandomService } from "../crypto-random.service";

const generator = new CryptoRandomService();

describe("CryptoRandomService", () => {
	describe("string", () => {
		it("generates an alphanumeric string by default", () => {
			const result = generator.string(16);

			expect(result).toHaveLength(16);
			expect(result).toMatch(/^[A-Za-z0-9]+$/);
		});

		it("respects uppercase-only configuration", () => {
			const result = generator.string(12, { uppercase: true });

			expect(result).toHaveLength(12);
			expect(result).toMatch(/^[A-Z]+$/);
		});

		it("respects digits-only configuration", () => {
			const result = generator.string(8, { digits: true });

			expect(result).toHaveLength(8);
			expect(result).toMatch(/^[0-9]+$/);
		});
	});

	describe("int", () => {
		it("delegates to the oslo helper", () => {
			const result = generator.int(10);

			expect(result).toEqual(expect.any(Number));
		});
	});
});
