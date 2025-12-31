import { err, ok } from "@mona-ca/core/result";
import { Value } from "@sinclair/typebox/value";
import { generateState } from "arctic";
import { t } from "elysia";
import { decodeBase64URLSafe, encodeBase64URLSafe } from "../../../../core/lib/encoding";

import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { Static, TIntersect, TLiteral, TObject, TString } from "@sinclair/typebox";
import type { IHmacService } from "../../../../core/ports/system";
import type { IHmacSignedStateService } from "../../application/ports/out/infra/hmac-signed-state.service.interface";

export class HmacSignedStateService<P extends string, S extends TObject> implements IHmacSignedStateService<S> {
	private readonly purpose: P;
	private readonly schema: TIntersect<
		[
			TObject<{
				purpose: TLiteral<P>;
				nonce: TString;
			}>,
			S,
		]
	>;
	private readonly hmacService: IHmacService;

	constructor(purpose: P, schema: S, hmacService: IHmacService) {
		this.purpose = purpose;
		this.schema = t.Intersect([t.Object({ purpose: t.Literal(purpose), nonce: t.String() }), schema]);
		this.hmacService = hmacService;
	}

	sign(payload: Static<S>): string {
		const nonce = generateState();

		const statePayload: Static<typeof this.schema> = {
			purpose: this.purpose,
			nonce,
			...payload,
		};

		const payloadBase64URL = encodeBase64URLSafe(JSON.stringify(statePayload));
		const signature = this.hmacService.sign(payloadBase64URL);

		return `${payloadBase64URL}.${signature}`;
	}

	verify(state: string): Result<Ok<Static<S>>, Err<"INVALID_STATE"> | Err<"STATE_DECODE_FAILED">> {
		try {
			const dot = state.indexOf(".");
			if (dot <= 0 || dot === state.length - 1) {
				return err("INVALID_STATE");
			}
			const payloadBase64URL = state.slice(0, dot);
			const signature = state.slice(dot + 1);

			if (!this.hmacService.verify(payloadBase64URL, signature)) {
				return err("INVALID_STATE");
			}

			const payloadString = decodeBase64URLSafe(payloadBase64URL);
			const payload = JSON.parse(payloadString);

			if (!Value.Check(this.schema, payload)) {
				return err("INVALID_STATE");
			}

			const { nonce, purpose, ...rest } = payload;

			if (purpose !== this.purpose) {
				return err("INVALID_STATE");
			}

			return ok(rest as Static<S>);
		} catch (e) {
			// biome-ignore lint/suspicious/noConsole: Logging state decode errors for debugging
			console.error(e);
			return err("STATE_DECODE_FAILED");
		}
	}
}
