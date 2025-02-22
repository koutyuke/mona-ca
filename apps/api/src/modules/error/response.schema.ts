import { t } from "elysia";

const errorResponseSchema = t.Object({
	code: t.String(),
	message: t.String(),
});

const internalServerErrorResponseSchema = t.Object({
	code: t.Literal("INTERNAL_SERVER_ERROR"),
	error: t.String(),
	cause: t.Union([t.String(), t.Null()]),
	stack: t.Union([t.String(), t.Null()]),
});

export { errorResponseSchema, internalServerErrorResponseSchema };
