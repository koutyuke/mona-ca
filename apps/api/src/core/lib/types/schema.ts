import { Kind, Type, TypeRegistry } from "@sinclair/typebox";
import { DefaultErrorFunction, SetErrorFunction, ValueErrorType } from "@sinclair/typebox/errors";

import type { SchemaOptions } from "@sinclair/typebox";

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
