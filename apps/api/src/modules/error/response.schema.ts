import { t } from "elysia";

export const ErrorResponseSchema = <Code extends string>(code: Code) =>
	t.Object({
		code: t.Literal(code),
		message: t.String(),
	});

export const ValidationErrorResponseSchema = t.Object({
	code: t.Literal("VALIDATION"),
	message: t.String(),
});

export const InternalServerErrorResponseSchema = t.Object({
	code: t.Literal("INTERNAL_SERVER_ERROR"),
	error: t.String(),
	cause: t.Union([t.String(), t.Null()]),
	stack: t.Union([t.String(), t.Null()]),
});
