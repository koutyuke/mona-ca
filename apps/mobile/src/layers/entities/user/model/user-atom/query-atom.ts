import { isErr } from "@mona-ca/core/utils";
import { atomWithQuery } from "jotai-tanstack-query";
import {
	FetchError,
	type QueryAtomError,
	ResultErrToFetchError,
	type ResultToFetchError,
} from "../../../../shared/api";
import { sessionTokenAtom } from "../../../session";
import { getMe } from "../../api/get-me";
import type { User } from "../user";

const STALE_TIME = 60 * 60 * 1000;

type GetMeFetchError = ResultToFetchError<Awaited<ReturnType<typeof getMe>>>;

export type QueryFnError = GetMeFetchError | FetchError<"UNAUTHORIZED">;

export const queryAtom = atomWithQuery<User, QueryAtomError<QueryFnError>>(get => {
	const token = get(sessionTokenAtom);

	const hasSession = token !== null;

	return {
		queryKey: ["users", "me"],
		queryFn: async () => {
			if (!token) {
				throw new FetchError("UNAUTHORIZED", "No session token");
			}

			const res = await getMe(token);

			if (isErr(res)) {
				throw ResultErrToFetchError(res);
			}

			return res.value;
		},
		staleTime: STALE_TIME,
		gcTime: STALE_TIME * 2,
		enabled: hasSession,
	};
});
