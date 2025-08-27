export type JSONPrimitive = string | number | boolean | null;

export type JSONValue =
	| JSONPrimitive
	| { [key: string]: JSONValue } // JSONObject
	| JSONValue[]; // JSONArray

export type ReadonlyJSONValue =
	| JSONPrimitive
	| { readonly [key: string]: ReadonlyJSONValue }
	| ReadonlyArray<ReadonlyJSONValue>;

export type JSONStringifyable =
	| JSONPrimitive
	| { [key: string]: JSONStringifyable }
	| JSONStringifyable[]
	| { toJSON(): JSONStringifyable };
