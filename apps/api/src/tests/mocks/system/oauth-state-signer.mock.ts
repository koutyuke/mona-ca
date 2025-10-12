import type { Static, TObject } from "@sinclair/typebox";
import type { IOAuthStateSigner } from "../../../application/ports/out/system";
import { type Err, type Result, err } from "../../../common/utils";

export class OAuthStateSignerMock<P extends TObject> implements IOAuthStateSigner<P> {
	generate(payload: Static<P>): string {
		const payloadString = JSON.stringify(payload);
		return `__oauth-state-signed:${payloadString}`;
	}

	validate(signedState: string): Result<Static<P>, Err<"INVALID_SIGNED_STATE"> | Err<"FAILED_TO_DECODE_SIGNED_STATE">> {
		const [prefix, payloadString] = signedState.split(":");
		if (prefix !== "__oauth-state-signed" || !payloadString) {
			return err("INVALID_SIGNED_STATE");
		}
		const payload = JSON.parse(payloadString);
		return payload as Static<P>;
	}
}
