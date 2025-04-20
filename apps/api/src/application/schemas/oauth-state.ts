import { t } from "elysia";
import { clientTypeSchema } from "../../domain/value-object/client-type";

export const oauthStateSchema = t.Object({
	clientType: clientTypeSchema,
});
