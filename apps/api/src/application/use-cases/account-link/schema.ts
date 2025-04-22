import { t } from "elysia";
import { oauthProviderSchema } from "../../../domain/value-object";
import { clientTypeSchema } from "../../../domain/value-object/client-type";

export const accountLinkStateSchema = t.Object({
	uid: t.String(),
	client: clientTypeSchema,
});

export const accountAssociationStateSchema = t.Object({
	uid: t.String(),
	provider: oauthProviderSchema,
	provider_id: t.String(),
	expires_at: t.Number(),
});
