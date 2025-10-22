import { t } from "elysia";
import { clientTypeSchema } from "../../../../../core/domain/value-objects";

export const oauthStateSchema = t.Object({
	client: clientTypeSchema,
});
