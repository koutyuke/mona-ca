import type { NewType } from "@mona-ca/core/utils";

export type UserId = NewType<"UserId", string>;

export const newUserId = (rawUserId: string) => {
	return rawUserId as UserId;
};
