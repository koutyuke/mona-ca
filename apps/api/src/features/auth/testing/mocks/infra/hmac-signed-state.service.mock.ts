import { type Err, type Ok, type Result, err, ok } from "@mona-ca/core/result";
import type { Static, TObject } from "@sinclair/typebox";
import type { IHmacSignedStateService } from "../../../application/ports/out/infra/hmac-signed-state.service.interface";

export class HmacSignedStateServiceMock<P extends TObject> implements IHmacSignedStateService<P> {
	public readonly signPrefix = "__hmac-signed-state-signed";

	sign(payload: Static<P>): string {
		const payloadString = JSON.stringify(payload);
		return `${this.signPrefix}:${payloadString}`;
	}

	verify(state: string): Result<Ok<Static<P>>, Err<"INVALID_STATE"> | Err<"STATE_DECODE_FAILED">> {
		const colon = state.indexOf(":");
		if (colon <= 0 || colon === state.length - 1) {
			return err("INVALID_STATE");
		}
		const prefix = state.slice(0, colon);
		const payloadString = state.slice(colon + 1);

		if (prefix !== this.signPrefix || !payloadString) {
			return err("INVALID_STATE");
		}
		const payload = JSON.parse(payloadString);
		return ok(payload as Static<P>);
	}
}
