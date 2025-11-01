import type { AnySessionToken } from "../../domain/value-objects/session-token";

export const toAnySessionTokenResponse = (sessionToken: AnySessionToken): string => sessionToken;
