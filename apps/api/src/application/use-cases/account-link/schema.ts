import { t } from "elysia";
import { clientTypeSchema } from "../../../domain/value-objects/client-type";

export const accountLinkStateSchema = t.Object({
	uid: t.String(),
	client: clientTypeSchema,
});
