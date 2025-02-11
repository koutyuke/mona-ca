import { t } from "elysia";

const errorResponseSchema = t.Object({
	error: t.String(),
	message: t.String(),
});

const internalServerErrorResponseSchema = t.Object({
	error: t.Literal("INTERNAL_SERVER_ERROR"),
	name: t.String(),
	cause: t.Union([t.String(), t.Null()]),
	stack: t.Union([t.String(), t.Null()]),
});

export { errorResponseSchema, internalServerErrorResponseSchema };
