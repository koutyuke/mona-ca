import { t } from "elysia";
import { clientTypeSchema } from "../../domain/value-object";

export const oauthStateSchema = t.Object({
	clientType: clientTypeSchema,
});
