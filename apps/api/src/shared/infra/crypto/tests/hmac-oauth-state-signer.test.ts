import type { Static } from "@sinclair/typebox";
import { t } from "elysia";
import { afterEach, describe, expect, it, vi } from "vitest";
import { decodeBase64URLSafe, encodeBase64URLSafe } from "../../../lib/encoding";
import { HmacOAuthStateSigner } from "../hmac-oauth-state-signer";
import { HmacSha256 } from "../hmac-sha-256";

const HMAC_SECRET = "test-secret-key";

const payloadSchema = t.Object({
	clientType: t.String(),
	locale: t.Optional(t.String()),
});

type Payload = Static<typeof payloadSchema>;

const createSigner = () => new HmacOAuthStateSigner<typeof payloadSchema>(HMAC_SECRET, payloadSchema);

describe("HmacOAuthStateSigner", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("generate", () => {
		it("returns a signed state containing the payload and a nonce", () => {
			const signer = createSigner();
			const payload: Payload = { clientType: "web" };

			const signedState = signer.generate(payload);
			const [encodedPayload, signature] = signedState.split(".");

			expect(encodedPayload).toBeDefined();
			expect(signature).toBeDefined();

			const parsedPayload = JSON.parse(decodeBase64URLSafe(encodedPayload ?? ""));

			expect(parsedPayload.clientType).toBe("web");
			expect(typeof parsedPayload.nonce).toBe("string");
			expect(parsedPayload.nonce).not.toHaveLength(0);
			expect(signature).toMatch(/^[a-f0-9]+$/i);
			// Should not leak the nonce back to consumers
			expect(parsedPayload.locale).toBeUndefined();
		});
	});

	describe("validate", () => {
		it("verifies a signed state and returns the original payload", () => {
			const signer = createSigner();
			const payload: Payload = { clientType: "web", locale: "ja-JP" };

			const signedState = signer.generate(payload);
			const result = signer.validate(signedState);

			expect(result.isErr).toBe(false);
			if (result.isErr) {
				throw new Error("Expected a successful validation result");
			}

			expect(result.value).toEqual(payload);
		});

		it("returns INVALID_SIGNED_STATE when the signature is tampered", () => {
			const signer = createSigner();
			const payload: Payload = { clientType: "web" };

			const signedState = signer.generate(payload);
			const tamperedState = `${signedState.slice(0, -1)}${signedState.endsWith("a") ? "b" : "a"}`;

			const result = signer.validate(tamperedState);

			expect(result.isErr).toBe(true);
			if (!result.isErr) {
				throw new Error("Expected tampered state to be rejected");
			}

			expect(result.code).toBe("INVALID_SIGNED_STATE");
		});

		it("returns INVALID_SIGNED_STATE when the payload does not match the schema", () => {
			const signer = createSigner();
			const hmac = new HmacSha256(HMAC_SECRET);
			const invalidPayloadBase64 = encodeBase64URLSafe(
				JSON.stringify({
					nonce: "static-nonce",
					unexpected: "value",
				}),
			);
			const signature = hmac.sign(invalidPayloadBase64);
			const invalidState = `${invalidPayloadBase64}.${signature}`;

			const result = signer.validate(invalidState);

			expect(result.isErr).toBe(true);
			if (!result.isErr) {
				throw new Error("Expected schema mismatch to be rejected");
			}

			expect(result.code).toBe("INVALID_SIGNED_STATE");
		});

		it("returns FAILED_TO_DECODE_SIGNED_STATE when the payload cannot be parsed", () => {
			const signer = createSigner();
			const hmac = new HmacSha256(HMAC_SECRET);
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const invalidJsonBase64 = encodeBase64URLSafe("not json");
			const signature = hmac.sign(invalidJsonBase64);
			const invalidState = `${invalidJsonBase64}.${signature}`;

			const result = signer.validate(invalidState);

			expect(result.isErr).toBe(true);
			if (!result.isErr) {
				throw new Error("Expected invalid JSON to be rejected");
			}

			expect(result.code).toBe("FAILED_TO_DECODE_SIGNED_STATE");
			expect(consoleErrorSpy).toHaveBeenCalled();
		});

		it("returns INVALID_SIGNED_STATE when state format is incorrect", () => {
			const signer = createSigner();
			const result = signer.validate("malformed-state");

			expect(result.isErr).toBe(true);
			if (!result.isErr) {
				throw new Error("Expected malformed state to be rejected");
			}

			expect(result.code).toBe("INVALID_SIGNED_STATE");
		});
	});
});
