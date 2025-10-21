import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { Static, TObject } from "@sinclair/typebox";

export interface IHmacOAuthStateSigner<P extends TObject> {
	generate(payload: Static<P>): string;
	validate(
		signedState: string,
	): Result<Ok<Static<P>>, Err<"INVALID_SIGNED_STATE"> | Err<"FAILED_TO_DECODE_SIGNED_STATE">>;
}
