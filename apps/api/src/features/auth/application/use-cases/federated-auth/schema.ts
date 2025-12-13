import { t } from "elysia";
import { clientPlatformSchema } from "../../../../../core/domain/value-objects";

export const federatedAuthStateSchema = t.Object({
	client: clientPlatformSchema,
});
