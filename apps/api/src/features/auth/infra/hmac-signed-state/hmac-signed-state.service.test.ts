import type { Static } from "@sinclair/typebox";
import { t } from "elysia";
import { assert, afterEach, describe, expect, it, vi } from "vitest";
import { decodeBase64URLSafe, encodeBase64URLSafe } from "../../../../core/lib/encoding";
import { HmacServiceMock } from "../../../../core/testing/mocks/system";
import { HmacSignedStateService } from "./hmac-signed-state.service";

const payloadSchema = t.Object({
	clientType: t.String(),
	locale: t.Optional(t.String()),
});

type Payload = Static<typeof payloadSchema>;

const hmacService = new HmacServiceMock();

const hmacSignedStateService = new HmacSignedStateService<"test-purpose", typeof payloadSchema>(
	"test-purpose",
	payloadSchema,
	hmacService,
);

describe("HmacSignedStateService", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("sign", () => {
		it("returns a signed state containing the payload and a nonce", () => {
			const payload: Payload = { clientType: "web" };

			const state = hmacSignedStateService.sign(payload);
			const [encodedPayload, signature] = state.split(".");

			expect(encodedPayload).toBeDefined();
			expect(signature).toBeDefined();

			const parsedPayload = JSON.parse(decodeBase64URLSafe(encodedPayload ?? ""));

			expect(parsedPayload.clientType).toBe("web");
			expect(typeof parsedPayload.nonce).toBe("string");
			expect(parsedPayload.nonce).not.toHaveLength(0);
			expect(signature).toMatch(/^__hmac:.*$/i);

			// Should not leak the nonce back to consumers
			expect(parsedPayload.locale).toBeUndefined();
		});
	});

	describe("verify", () => {
		it("verifies a signed state and returns the original payload", () => {
			const payload: Payload = { clientType: "web", locale: "ja-JP" };

			const state = hmacSignedStateService.sign(payload);
			const result = hmacSignedStateService.verify(state);

			expect(result.isErr).toBe(false);
			assert(result.isOk);

			expect(result.value).toEqual(payload);
		});

		it("returns INVALID_STATE when the signature is tampered", () => {
			const payload: Payload = { clientType: "web" };

			const state = hmacSignedStateService.sign(payload);
			const tamperedState = `${state.slice(0, -1)}${state.endsWith("a") ? "b" : "a"}`;

			const result = hmacSignedStateService.verify(tamperedState);

			expect(result.isErr).toBe(true);
			assert(result.isErr);
			expect(result.code).toBe("INVALID_STATE");
		});

		it("returns INVALID_STATE when the payload does not match the schema", () => {
			const invalidPayloadBase64 = encodeBase64URLSafe(
				JSON.stringify({
					nonce: "static-nonce",
					unexpected: "value",
				}),
			);
			const signature = hmacService.sign(invalidPayloadBase64);
			const invalidState = `${invalidPayloadBase64}.${signature}`;

			const result = hmacSignedStateService.verify(invalidState);

			expect(result.isErr).toBe(true);
			assert(result.isErr);

			expect(result.code).toBe("INVALID_STATE");
		});

		it("returns STATE_DECODE_FAILED when the payload cannot be parsed", () => {
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const invalidJsonBase64 = encodeBase64URLSafe("not json");
			const signature = hmacService.sign(invalidJsonBase64);
			const invalidState = `${invalidJsonBase64}.${signature}`;

			const result = hmacSignedStateService.verify(invalidState);

			expect(result.isErr).toBe(true);
			assert(result.isErr);

			expect(result.code).toBe("STATE_DECODE_FAILED");
			expect(consoleErrorSpy).toHaveBeenCalled();
		});

		it("returns INVALID_STATE when state format is incorrect", () => {
			const result = hmacSignedStateService.verify("malformed-state");

			expect(result.isErr).toBe(true);
			assert(result.isErr);

			expect(result.code).toBe("INVALID_STATE");
		});

		it("returns INVALID_STATE when the purpose is incorrect", () => {
			const otherHmacOAuthStateService = new HmacSignedStateService<"other-purpose", typeof payloadSchema>(
				"other-purpose",
				payloadSchema,
				hmacService,
			);
			const payload: Payload = { clientType: "web" };
			const invalidState = otherHmacOAuthStateService.sign(payload);
			const result = hmacSignedStateService.verify(invalidState);

			expect(result.isErr).toBe(true);
			assert(result.isErr);
			expect(result.code).toBe("INVALID_STATE");
			expect(invalidState).not.toBe(hmacSignedStateService.sign(payload));
		});
	});
});
