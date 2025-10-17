import { t } from "elysia";
import { clientTypeSchema } from "../../../../../common/domain/value-objects";

export const oauthStateSchema = t.Object({
	client: clientTypeSchema,
});
