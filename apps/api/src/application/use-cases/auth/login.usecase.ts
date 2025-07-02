import { err, ulid } from "../../../common/utils";
import { createSession } from "../../../domain/entities";
import { newSessionId } from "../../../domain/value-object";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IPasswordService } from "../../services/password";
import { type ISessionSecretService, createSessionToken } from "../../services/session";
import type { ILoginUseCase, LoginUseCaseResult } from "./interfaces/login.usecase.interface";

export class LoginUseCase implements ILoginUseCase {
	constructor(
		private readonly sessionRepository: ISessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly passwordService: IPasswordService,
		private readonly sessionSecretService: ISessionSecretService,
	) {}

	public async execute(email: string, password: string): Promise<LoginUseCaseResult> {
		const user = await this.userRepository.findByEmail(email);
		const passwordHash = user ? await this.userRepository.findPasswordHashById(user.id) : null;
		const verifyPassword = passwordHash ? await this.passwordService.verifyPassword(password, passwordHash) : false;

		if (!(user && passwordHash && verifyPassword)) {
			return err("INVALID_EMAIL_OR_PASSWORD");
		}

		const sessionSecret = this.sessionSecretService.generateSessionSecret();
		const sessionSecretHash = this.sessionSecretService.hashSessionSecret(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = createSessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId: user.id,
			secretHash: sessionSecretHash,
		});

		await this.sessionRepository.save(session);

		return {
			session,
			sessionToken,
		};
	}
}
