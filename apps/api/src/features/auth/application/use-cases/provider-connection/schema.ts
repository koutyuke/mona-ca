import { t } from "elysia";
import { clientPlatformSchema } from "../../../../../core/domain/value-objects";

export const providerConnectionStateSchema = t.Object({
	uid: t.String(),
	client: clientPlatformSchema,
});
