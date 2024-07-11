import { t } from "elysia";

const errorResponseSchema = t.Object({
	name: t.String(),
	message: t.String(),
});

export { errorResponseSchema };
