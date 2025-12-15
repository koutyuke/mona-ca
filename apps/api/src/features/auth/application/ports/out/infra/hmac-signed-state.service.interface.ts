import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { Static, TObject } from "@sinclair/typebox";

export interface IHmacSignedStateService<P extends TObject> {
	sign(payload: Static<P>): string;
	verify(state: string): Result<Ok<Static<P>>, Err<"INVALID_STATE"> | Err<"STATE_DECODE_FAILED">>;
}
