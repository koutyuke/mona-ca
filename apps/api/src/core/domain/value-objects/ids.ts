import type { Brand } from "@mona-ca/core/types";

export type UserId = Brand<"UserId", string>;

export const newUserId = (rawUserId: string) => {
	return rawUserId as UserId;
};
