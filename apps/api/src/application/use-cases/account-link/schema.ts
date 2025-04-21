import { t } from "elysia";
import { clientTypeSchema } from "../../../domain/value-object/client-type";

export const accountLinkStateSchema = t.Object({
	uid: t.String(),
	client: clientTypeSchema,
});
