import type { Static, TObject } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { generateState } from "arctic";
import { t } from "elysia";
import {
	type Err,
	type Result,
	constantTimeCompare,
	decodeBase64URLSafe,
	encodeBase64URLSafe,
	err,
	generateHMAC,
} from "../../../../common/utils";

export const generateSignedState = <P extends object>(payload: P, hmacSecret: string): string => {
	const nonce = generateState();

	const statePayload = {
		nonce,
		...payload,
	};

	const payloadBase64URL = encodeBase64URLSafe(JSON.stringify(statePayload));
	const signature = generateHMAC(payloadBase64URL, hmacSecret, "base64url");

	return `${payloadBase64URL}.${signature}`;
};

export const validateSignedState = <P extends TObject>(
	signedState: string,
	hmacSecret: string,
	payloadSchema: P,
): Result<Static<P>, Err<"INVALID_SIGNED_STATE"> | Err<"FAILED_TO_DECODE_SIGNED_STATE">> => {
	try {
		const [payloadBase64URL, signature] = signedState.split(".");

		if (!payloadBase64URL || !signature) {
			return err("INVALID_SIGNED_STATE");
		}

		const expectedSignature = generateHMAC(payloadBase64URL, hmacSecret, "base64url");

		if (!constantTimeCompare(signature, expectedSignature)) {
			return err("INVALID_SIGNED_STATE");
		}

		const payloadString = decodeBase64URLSafe(payloadBase64URL);
		const payload = JSON.parse(payloadString);

		const schema = t.Intersect([payloadSchema, t.Object({ nonce: t.String() })]);

		if (!Value.Check(schema, payload)) {
			return err("INVALID_SIGNED_STATE");
		}

		const { nonce, ...rest } = payload;

		return rest as Static<P>;
	} catch (e) {
		console.error(e);
		return err("FAILED_TO_DECODE_SIGNED_STATE");
	}
};
