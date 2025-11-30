import { t } from "elysia";
import { clientPlatformSchema } from "../../../../../core/domain/value-objects";

export const oauthStateSchema = t.Object({
	client: clientPlatformSchema,
});
