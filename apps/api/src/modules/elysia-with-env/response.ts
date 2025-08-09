import { type TSchema, type TUnion, Type, TypeGuard } from "@sinclair/typebox";
import { t } from "elysia";

type StatusCode =
	| 200
	| 201
	| 202
	| 204
	| 301
	| 302
	| 303
	| 304
	| 307
	| 308
	| 400
	| 401
	| 403
	| 404
	| 405
	| 409
	| 410
	| 412
	| 413
	| 414
	| 415
	| 416
	| 417
	| 418
	| 422
	| 429
	| 500
	| 502
	| 503
	| 504;

// Return Response
export const NoContentResponse = () => new Response(null, { status: 204 }) as unknown as null;

export const RedirectResponse = (url: string, status: 302 | 301 | 303 | 307 | 308 = 302) =>
	new Response(null, { status, headers: { location: url } }) as unknown as null;

// Return Response Schema
export const NoContentResponseSchema = t.Null();
export const RedirectResponseSchema = t.Null();

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

// Error Response
export const ErrorResponseSchema = <Code extends string>(code: Code) =>
	t.Object({
		code: t.Literal(code),
		message: t.String(),
	});

export const ParseErrorResponseSchema = ErrorResponseSchema("PARSE_ERROR");

export const InvalidCookieSignatureErrorResponseSchema = ErrorResponseSchema("INVALID_COOKIE_SIGNATURE");

export const NotFoundErrorResponseSchema = ErrorResponseSchema("NOT_FOUND");

export const ValidationErrorResponseSchema = ErrorResponseSchema("VALIDATION");

export const InternalServerErrorResponseSchema = ErrorResponseSchema("INTERNAL_SERVER_ERROR");

export const UnknownErrorResponseSchema = ErrorResponseSchema("UNKNOWN_ERROR");

const baseResponseSchema = {
	400: Type.Union([ParseErrorResponseSchema, InvalidCookieSignatureErrorResponseSchema]),
	422: ValidationErrorResponseSchema,
	500: Type.Union([InternalServerErrorResponseSchema, UnknownErrorResponseSchema]),
} as const;

export const withBaseResponseSchema = <R extends Partial<Record<StatusCode, TSchema>>>(
	response: R,
): {
	[K in keyof R | keyof typeof baseResponseSchema]: K extends keyof typeof baseResponseSchema
		? R[K] extends TSchema
			? TUnion<[(typeof baseResponseSchema)[K], R[K]]>
			: (typeof baseResponseSchema)[K]
		: R[K] extends TSchema
			? R[K]
			: never;
} => {
	const result: Partial<Record<StatusCode, TSchema>> = {
		...response,
		400: response[400] ? ResponseTUnion(response[400], baseResponseSchema[400]) : baseResponseSchema[400],
		422: response[422] ? ResponseTUnion(response[422], baseResponseSchema[422]) : baseResponseSchema[422],
		500: response[500] ? ResponseTUnion(response[500], baseResponseSchema[500]) : baseResponseSchema[500],
	};

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	return result as any;
};
