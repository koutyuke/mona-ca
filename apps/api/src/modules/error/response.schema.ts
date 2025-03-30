import { t } from "elysia";

const ErrorResponseSchema = <Code extends string>(codeSchema: Code) =>
	t.Object({
		code: t.Literal(codeSchema),
		message: t.String(),
	});

const InternalServerErrorResponseSchema = t.Object({
	code: t.Literal("INTERNAL_SERVER_ERROR"),
	error: t.String(),
	cause: t.Union([t.String(), t.Null()]),
	stack: t.Union([t.String(), t.Null()]),
});

export { ErrorResponseSchema, InternalServerErrorResponseSchema };
