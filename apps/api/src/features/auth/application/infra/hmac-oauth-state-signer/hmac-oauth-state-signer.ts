import { type Err, type Ok, type Result, err, ok } from "@mona-ca/core/utils";
import type { Static, TObject } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { generateState } from "arctic";
import { t } from "elysia";
import { decodeBase64URLSafe, encodeBase64URLSafe } from "../../../../../shared/lib/encoding";
import { timingSafeStringEqual } from "../../../../../shared/lib/security";
import type { IMac } from "../../../../../shared/ports/system";
import type { IHmacOAuthStateSigner } from "../../ports/infra/hmac-oauth-state-signer.interface";

export class HmacOAuthStateSigner<P extends TObject> implements IHmacOAuthStateSigner<P> {
	private readonly schema: P;
	private readonly hmacSha256: IMac;

	constructor(schema: P, hmacSha256: IMac) {
		this.schema = schema;
		this.hmacSha256 = hmacSha256;
	}

	generate(payload: Static<P>): string {
		const nonce = generateState();

		const statePayload = {
			nonce,
			...payload,
		};

		const payloadBase64URL = encodeBase64URLSafe(JSON.stringify(statePayload));
		const signature = this.hmacSha256.sign(payloadBase64URL);

		return `${payloadBase64URL}.${signature}`;
	}

	validate(
		signedState: string,
	): Result<Ok<Static<P>>, Err<"INVALID_SIGNED_STATE"> | Err<"FAILED_TO_DECODE_SIGNED_STATE">> {
		try {
			const [payloadBase64URL, signature] = signedState.split(".");

			if (!payloadBase64URL || !signature) {
				return err("INVALID_SIGNED_STATE");
			}

			const expectedSignature = this.hmacSha256.sign(payloadBase64URL);

			if (!timingSafeStringEqual(signature, expectedSignature)) {
				return err("INVALID_SIGNED_STATE");
			}

			const payloadString = decodeBase64URLSafe(payloadBase64URL);
			const payload = JSON.parse(payloadString);

			const schema = t.Intersect([this.schema, t.Object({ nonce: t.String() })]);

			if (!Value.Check(schema, payload)) {
				return err("INVALID_SIGNED_STATE");
			}

			const { nonce, ...rest } = payload;

			return ok(rest as Static<P>);
		} catch (e) {
			console.error(e);
			return err("FAILED_TO_DECODE_SIGNED_STATE");
		}
	}
}
