import { err, generateRandomString, ulid } from "../../../common/utils";
import { type SignupSession, createSignupSession } from "../../../domain/entities";
import { formatSessionToken, newSignupSessionId } from "../../../domain/value-object";
import type { SignupSessionToken } from "../../../domain/value-object";
import { generateSessionSecret, hashSessionSecret } from "../../../infrastructure/crypt";
import type { ISignupSessionRepository } from "../../../interface-adapter/repositories/signup-session/interfaces/signup-session.repository.interface";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { ISignupRequestUseCase, SignupRequestUseCaseResult } from "./interfaces/signup-request.usecase.interface";

export class SignupRequestUseCase implements ISignupRequestUseCase {
	constructor(
		private readonly signupSessionRepository: ISignupSessionRepository,
		private readonly userRepository: IUserRepository,
	) {}

	async execute(email: string): Promise<SignupRequestUseCaseResult> {
		const user = await this.userRepository.findByEmail(email);

		if (user !== null) {
			return err("EMAIL_ALREADY_USED");
		}

		await this.signupSessionRepository.deleteByEmail(email);

		const { signupSessionToken, signupSession } = this.createSignupSession(email);

		await this.signupSessionRepository.save(signupSession);

		return {
			signupSessionToken,
			signupSession,
		};
	}

	private createSignupSession(email: string): { signupSessionToken: SignupSessionToken; signupSession: SignupSession } {
		const code = generateRandomString(8, {
			number: true,
		});

		const signupSessionSecret = generateSessionSecret();
		const signupSessionSecretHash = hashSessionSecret(signupSessionSecret);
		const signupSessionId = newSignupSessionId(ulid());
		const signupSession = createSignupSession({
			id: signupSessionId,
			email,
			code,
			secretHash: signupSessionSecretHash,
		});
		const signupSessionToken = formatSessionToken(signupSessionId, signupSessionSecret);

		return { signupSessionToken, signupSession };
	}
}
