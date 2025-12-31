import { err } from "@mona-ca/core/result";
import { atomWithQuery } from "jotai-tanstack-query";
import { queryFnFromResult } from "../../../../shared/api/tanstack-query";
import { sessionTokenAtom } from "../../../session";
import { getUserProfile } from "../../api/get-user-profile";

import type { QueryFnResponse } from "../../../../shared/api/tanstack-query";

const STALE_TIME = 60 * 60 * 1000;

const qf = (token: string | null) =>
	queryFnFromResult(async () => {
		if (!token) {
			return err("UNAUTHORIZED", { errorMessage: "No session token" });
		}
		return await getUserProfile(token);
	});

type Response = QueryFnResponse<ReturnType<typeof qf>>;

export const queryAtom = atomWithQuery<Response["ok"], Response["err"]>(get => {
	const token = get(sessionTokenAtom);

	const hasSession = token !== null;

	return {
		queryKey: ["users", "me"],
		queryFn: qf(token),
		staleTime: STALE_TIME,
		gcTime: STALE_TIME * 2,
		enabled: hasSession,
	};
});
