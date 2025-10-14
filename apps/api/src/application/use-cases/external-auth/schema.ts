import { t } from "elysia";
import { clientTypeSchema } from "../../../domain/value-objects";

export const oauthStateSchema = t.Object({
	client: clientTypeSchema,
});
