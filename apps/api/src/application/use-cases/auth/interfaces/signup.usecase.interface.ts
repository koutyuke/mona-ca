import type { Err, Result } from "../../../../common/utils";
import type { Session, User } from "../../../../domain/entities";

export type SignupUseCaseSuccessResult = {
	user: User;
	session: Session;
	sessionToken: string;
};

export type SignupUseCaseErrorResult = Err<"EMAIL_IS_ALREADY_USED">;

export type SignupUseCaseResult = Result<SignupUseCaseSuccessResult, SignupUseCaseErrorResult>;

export interface ISignupUseCase {
	execute(name: string, email: string, password: string, gender: "man" | "woman"): Promise<SignupUseCaseResult>;
}
