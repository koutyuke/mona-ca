import type { Err, Ok, Result } from "@mona-ca/core/utils";
import type { UserId } from "../../../../../shared/domain/value-objects";
import type { Profile } from "../../../domain/entities/profile";

export type GetProfileUseCaseResult = Result<Ok<{ profile: Profile }>, Err<"PROFILE_NOT_FOUND">>;

export interface IGetProfileUseCase {
	execute(userId: UserId): Promise<GetProfileUseCaseResult>;
}
