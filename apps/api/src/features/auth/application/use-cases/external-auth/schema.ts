import { t } from "elysia";
import { clientTypeSchema } from "../../../../../shared/domain/value-objects";

export const oauthStateSchema = t.Object({
	client: clientTypeSchema,
});
