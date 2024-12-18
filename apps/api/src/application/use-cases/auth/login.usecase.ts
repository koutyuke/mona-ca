import { sessionExpiresSpan } from "../../../common/constants";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IUserCredentialRepository } from "../../../interface-adapter/repositories/user-credential";
import type { IPasswordService } from "../../../services/password";
import type { ISessionTokenService } from "../../../services/session-token";
import type { ILoginUseCase, ILoginUseCaseResult } from "./interface/login.usecase.interface";

export class LoginUseCase implements ILoginUseCase {
	constructor(
		private readonly sessionRepository: ISessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly userCredentialRepository: IUserCredentialRepository,
		private readonly passwordService: IPasswordService,
		private readonly sessionTokenService: ISessionTokenService,
	) {}

	public async execute(email: string, password: string): Promise<ILoginUseCaseResult> {
		const user = await this.userRepository.findByEmail(email);
		const credentials = user ? await this.userCredentialRepository.find(user.id) : null;

		if (
			!(
				user &&
				credentials &&
				credentials.passwordHash &&
				(await this.passwordService.verifyPassword(password, credentials.passwordHash))
			)
		) {
			throw new Error("Invalid email or password.");
		}

		const sessionToken = this.sessionTokenService.generateSessionToken();
		const sessionId = this.sessionTokenService.hashSessionToken(sessionToken);

		const session = await this.sessionRepository.create({
			id: sessionId,
			userId: user.id,
			expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds()),
		});

		return {
			session,
			sessionToken,
		};
	}
}
