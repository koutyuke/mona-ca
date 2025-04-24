import { t } from "elysia";
import { describe, expect, it } from "vitest";
import { isErr } from "../../../../common/utils";
import { generateSignedState, validateSignedState } from "./signed-state";

describe("Signed State", () => {
	const hmacSecret = "test-secret-key";
	const clientType = "web";
	const payloadSchema = t.Object({ clientType: t.String() });

	describe("generateSignedState", () => {
		it("should generate a valid signed state", () => {
			const signedState = generateSignedState({ clientType }, hmacSecret);
			expect(typeof signedState).toBe("string");
			expect(signedState.length).toBeGreaterThan(0);
		});

		it("should generate different states for different client types", () => {
			const webClientType = "web";
			const mobileClientType = "mobile";

			const webSignedState = generateSignedState({ clientType: webClientType }, hmacSecret);
			const mobileSignedState = generateSignedState({ clientType: mobileClientType }, hmacSecret);

			expect(webSignedState).not.toBe(mobileSignedState);
		});

		it("should generate different states for different secrets", () => {
			const secret1 = "secret1";
			const secret2 = "secret2";

			const state1 = generateSignedState({ clientType }, secret1);
			const state2 = generateSignedState({ clientType }, secret2);

			expect(state1).not.toBe(state2);
		});
	});

	describe("validateSignedState", () => {
		it("should validate a correctly signed state", () => {
			const signedState = generateSignedState({ clientType }, hmacSecret);
			const result = validateSignedState(signedState, hmacSecret, payloadSchema);

			expect(result).not.toBeNull();
			if (isErr(result)) {
				throw new Error("Invalid signed state");
			}

			expect(result.clientType).toBe(clientType);
		});

		it("should return error object for tampered state", () => {
			const signedState = generateSignedState({ clientType }, hmacSecret);
			// Tamper with the state by replacing a character
			const tamperedState = `${signedState.slice(0, -1)}X`;

			const result = validateSignedState(tamperedState, hmacSecret, payloadSchema);
			expect(isErr(result)).toBe(true);
		});

		it("should return error object for state signed with different secret", () => {
			const signedState = generateSignedState({ clientType }, hmacSecret);
			const differentSecret = "different-secret";

			const result = validateSignedState(signedState, differentSecret, payloadSchema);
			expect(isErr(result)).toBe(true);
		});

		it("should return error object for malformed state", () => {
			const invalidState = "invalid-base64";

			const result = validateSignedState(invalidState, hmacSecret, payloadSchema);
			expect(isErr(result)).toBe(true);
		});
	});
});
