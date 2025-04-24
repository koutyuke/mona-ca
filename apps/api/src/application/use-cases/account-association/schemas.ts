import { t } from "elysia";
import { oauthProviderSchema } from "../../../domain/value-object";

export const accountAssociationStateSchema = t.Object({
	uid: t.String(),
	provider: oauthProviderSchema,
	provider_id: t.String(),
	expires_at: t.Number(),
});
