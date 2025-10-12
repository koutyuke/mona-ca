import type { Static, TObject } from "@sinclair/typebox";
import type { Err, Result } from "../../../../common/utils";

export interface IOAuthStateSigner<P extends TObject> {
	generate(payload: Static<P>): string;
	validate(signedState: string): Result<Static<P>, Err<"INVALID_SIGNED_STATE"> | Err<"FAILED_TO_DECODE_SIGNED_STATE">>;
}
