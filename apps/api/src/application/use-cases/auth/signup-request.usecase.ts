import { err, ulid } from "../../../common/utils";
import { type SignupSession, createSignupSession } from "../../../domain/entities";
import { formatSessionToken, newSignupSessionId } from "../../../domain/value-object";
import type { SignupSessionToken } from "../../../domain/value-object";
import type { ISignupRequestUseCase, SignupRequestUseCaseResult } from "../../ports/in";
import type { IUserRepository } from "../../ports/out/repositories";
import type { ISignupSessionRepository } from "../../ports/out/repositories";
import type { IRandomGenerator, ISessionSecretHasher } from "../../ports/out/system";

export class SignupRequestUseCase implements ISignupRequestUseCase {
	constructor(
		private readonly signupSessionRepository: ISignupSessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly sessionSecretHasher: ISessionSecretHasher,
		private readonly randomGenerator: IRandomGenerator,
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
		const code = this.randomGenerator.string(8, {
			digits: true,
		});

		const signupSessionSecret = this.sessionSecretHasher.generate();
		const signupSessionSecretHash = this.sessionSecretHasher.hash(signupSessionSecret);
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
