import { type TUnion, Type, TypeGuard } from "@sinclair/typebox";
import { type TSchema, t } from "elysia";

export const StringEnum = <T extends string[]>(values: [...T]) =>
	t.Unsafe<T[number]>({
		type: "string",
		enum: values,
	});

export const Nullable = <T extends TSchema>(T: T) => {
	return t.Union([T, t.Null()]);
};

// This function flattens a union of unions into a single union.
// Warning: This function is not type-safe.
//          It is recommended to be used only for the response schema.
export const FlattenUnion = <const T extends TSchema[]>(...schemas: T): TUnion<T> => {
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
