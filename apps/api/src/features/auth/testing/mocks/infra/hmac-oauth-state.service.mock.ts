import { type Err, type Ok, type Result, err, ok } from "@mona-ca/core/result";
import type { Static, TObject } from "@sinclair/typebox";
import type { IHmacOAuthStateService } from "../../../application/ports/infra/hmac-oauth-state.service.interface";

export class HmacOAuthStateServiceMock<P extends TObject> implements IHmacOAuthStateService<P> {
	generate(payload: Static<P>): string {
		const payloadString = JSON.stringify(payload);
		return `__hmac-oauth-state-signed:${payloadString}`;
	}

	validate(
		signedState: string,
	): Result<Ok<Static<P>>, Err<"INVALID_SIGNED_STATE"> | Err<"FAILED_TO_DECODE_SIGNED_STATE">> {
		const colon = signedState.indexOf(":");
		if (colon <= 0 || colon === signedState.length - 1) {
			return err("INVALID_SIGNED_STATE");
		}
		const prefix = signedState.slice(0, colon);
		const payloadString = signedState.slice(colon + 1);

		if (prefix !== "__hmac-oauth-state-signed" || !payloadString) {
			return err("INVALID_SIGNED_STATE");
		}
		const payload = JSON.parse(payloadString);
		return ok(payload as Static<P>);
	}
}
