import { ResultErrToFetchError } from "./fetch-error";

import type { Err, Ok, Result } from "@mona-ca/core/result";
import type { QueryFunctionContext, QueryKey } from "@tanstack/query-core";
import type { FetchError } from "./fetch-error";

declare const __TYPE_ONLY_fn_return_type: unique symbol;

type QueryFnReturnType<TOkValue, TErrCode extends string> = TOkValue & {
	[__TYPE_ONLY_fn_return_type]: {
		ok: TOkValue;
		err: FetchError<TErrCode>;
	};
};

export const queryFnFromResult =
	<TOkValue, TErrCode extends string, TQueryKey extends QueryKey, TPageParam = never>(
		queryFn: (
			context: QueryFunctionContext<TQueryKey, TPageParam>,
		) => Promise<Result<Ok<TOkValue>, Err<TErrCode, { errorMessage: string }>>>,
	): ((ctx: QueryFunctionContext<TQueryKey, TPageParam>) => Promise<QueryFnReturnType<TOkValue, TErrCode>>) =>
	async (ctx: QueryFunctionContext<TQueryKey, TPageParam>) => {
		const res = await queryFn(ctx);
		if (res.isErr) {
			throw ResultErrToFetchError(res);
		}
		return res.value as QueryFnReturnType<TOkValue, TErrCode>;
	};

export type QueryFnResponse<
	// biome-ignore lint/suspicious/noExplicitAny: Required for generic query function typing
	T extends (...args: any[]) => QueryFnReturnType<any, any> | Promise<QueryFnReturnType<any, any>>,
> =
	Awaited<ReturnType<T>> extends QueryFnReturnType<infer TOkValue, infer TErrCode>
		? {
				ok: TOkValue;
				err: FetchError<TErrCode>;
			}
		: never;
