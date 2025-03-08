import type { Err, Result } from "../../../../common/utils";
import type { Session, User } from "../../../../domain/entities";
import type { Gender } from "../../../../domain/value-object";

export type SignupUseCaseSuccessResult = {
	user: User;
	session: Session;
	sessionToken: string;
};

export type SignupUseCaseErrorResult = Err<"EMAIL_IS_ALREADY_USED">;

export type SignupUseCaseResult = Result<SignupUseCaseSuccessResult, SignupUseCaseErrorResult>;

export interface ISignupUseCase {
	execute(name: string, email: string, password: string, gender: Gender): Promise<SignupUseCaseResult>;
}
