import { type TSchema, type TUnion, Type, TypeGuard } from "@sinclair/typebox";
import { t } from "elysia";

export const NoContentResponse = () => new Response(null, { status: 204 }) as unknown as null;

export const NoContentResponseSchema = t.Null();

export const RedirectResponse = (url: string, status: 302 | 301 | 303 | 307 | 308 = 302) =>
	new Response(null, { status, headers: { location: url } }) as unknown as null;

export const RedirectResponseSchema = t.Null();

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

// This function flattens a union of unions into a single union.
// Warning: This function is not type-safe.
//          It is recommended to be used only for the response schema.
export const ResponseTUnion = <const T extends TSchema[]>(...schemas: T): TUnion<T> => {
	const result: TSchema[] = [];

	const flatten = (schema: TSchema) => {
		if (TypeGuard.IsUnion(schema)) {
			for (const inner of schema.anyOf) {
				flatten(inner);
			}
		} else {
			result.push(schema);
		}
	};

	for (const schema of schemas) {
		flatten(schema);
	}

	return Type.Union(result) as unknown as TUnion<T>;
};
