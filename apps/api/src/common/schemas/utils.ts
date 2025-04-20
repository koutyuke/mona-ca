import { Kind, type SchemaOptions, type TSchema, type TUnion, Type, TypeGuard, TypeRegistry } from "@sinclair/typebox";
import { DefaultErrorFunction, SetErrorFunction, ValueErrorType } from "@sinclair/typebox/errors";

TypeRegistry.Set("StringEnum", (schema: { enum: string[] }, value: unknown) => {
	return typeof value === "string" && schema.enum.includes(value);
});

SetErrorFunction(error => {
	if (error.errorType === ValueErrorType.Kind) {
		if (
			error.schema.type === "string" &&
			typeof error.value === "string" &&
			error.schema.enum &&
			!error.schema.enum.includes(error.value)
		) {
			return `Must include valid value: [${error.schema.enum.join(", ")}]`;
		}
	}

	return DefaultErrorFunction(error);
});

// create a type method for string enum
export const StringEnum = <T extends string[]>(values: [...T], options: SchemaOptions = {}) => {
	return Type.Unsafe<T[number]>({
		...options,
		[Kind]: "StringEnum",
		type: "string",
		enum: values,
	});
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
