import type { Err, Result } from "../../../../common/utils";
import type { Session, User } from "../../../../domain/entities";
import type { Gender } from "../../../../domain/value-object";

type Success = {
	user: User;
	session: Session;
	sessionToken: string;
};

type Error = Err<"EMAIL_ALREADY_REGISTERED">;

export type SignupUseCaseResult = Result<Success, Error>;

export interface ISignupUseCase {
	execute(name: string, email: string, password: string, gender: Gender): Promise<SignupUseCaseResult>;
}
