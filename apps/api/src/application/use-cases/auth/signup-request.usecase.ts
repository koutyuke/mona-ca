import { err, generateRandomString, ulid } from "../../../common/utils";
import { type SignupSession, createSignupSession } from "../../../domain/entities";
import { newSignupSessionId } from "../../../domain/value-object";
import type { ISignupSessionRepository } from "../../../interface-adapter/repositories/signup-session/interfaces/signup-session.repository.interface";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import { type ISessionSecretService, createSessionToken } from "../../services/session";
import type { ISignupRequestUseCase, SignupRequestUseCaseResult } from "./interfaces/signup-request.usecase.interface";

export class SignupRequestUseCase implements ISignupRequestUseCase {
	constructor(
		private readonly signupSessionRepository: ISignupSessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly signupSessionSecretService: ISessionSecretService,
	) {}

	async execute(email: string): Promise<SignupRequestUseCaseResult> {
		const user = await this.userRepository.findByEmail(email);

		if (user !== null) {
			return err("EMAIL_ALREADY_USED");
		}

		await this.signupSessionRepository.deleteByEmail(email);

		const { sessionToken, session } = this.createSignupSession(email);

		await this.signupSessionRepository.save(session);

		return {
			signupSessionToken: sessionToken,
			signupSession: session,
		};
	}

	private createSignupSession(email: string): { sessionToken: string; session: SignupSession } {
		const code = generateRandomString(8, {
			number: true,
		});

		const signupSessionSecret = this.signupSessionSecretService.generateSessionSecret();
		const signupSessionSecretHash = this.signupSessionSecretService.hashSessionSecret(signupSessionSecret);
		const signupSessionId = newSignupSessionId(ulid());
		const signupSession = createSignupSession({
			id: signupSessionId,
			email,
			code,
			secretHash: signupSessionSecretHash,
		});
		const signupSessionToken = createSessionToken(signupSessionId, signupSessionSecret);

		return { sessionToken: signupSessionToken, session: signupSession };
	}
}
