import { t } from "elysia";
import { clientTypeSchema } from "../../../../../shared/domain/value-objects";

export const accountLinkStateSchema = t.Object({
	uid: t.String(),
	client: clientTypeSchema,
});
