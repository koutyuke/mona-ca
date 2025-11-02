import { t } from "elysia";
import { clientTypeSchema } from "../../../../../core/domain/value-objects";

export const accountLinkStateSchema = t.Object({
	uid: t.String(),
	client: clientTypeSchema,
});
