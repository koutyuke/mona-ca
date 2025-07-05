import { ulid } from "../../../common/utils";
import { err } from "../../../common/utils";
import { createSession, createUser } from "../../../domain/entities";
import { type Gender, newSessionId, newUserId } from "../../../domain/value-object";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IPasswordService } from "../../services/password";
import { type ISessionSecretService, createSessionToken } from "../../services/session";
import type { ISignupUseCase, SignupUseCaseResult } from "./interfaces/signup.usecase.interface";

export class SignupUseCase implements ISignupUseCase {
	constructor(
		private readonly sessionRepository: ISessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly passwordService: IPasswordService,
		private readonly sessionSecretService: ISessionSecretService,
	) {}

	public async execute(name: string, email: string, password: string, gender: Gender): Promise<SignupUseCaseResult> {
		const existingSameEmailUser = await this.userRepository.findByEmail(email); // check pre-register user

		if (existingSameEmailUser) {
			if (existingSameEmailUser.emailVerified) {
				return err("EMAIL_ALREADY_REGISTERED");
			}

			await this.userRepository.deleteById(existingSameEmailUser.id);
		}

		const userId = newUserId(ulid());
		const passwordHash = await this.passwordService.hashPassword(password);
		const user = createUser({
			id: userId,
			name,
			email,
			emailVerified: false,
			iconUrl: null,
			gender,
		});

		const sessionSecret = this.sessionSecretService.generateSessionSecret();
		const sessionSecretHash = this.sessionSecretService.hashSessionSecret(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = createSessionToken(sessionId, sessionSecret);
		const session = createSession({
			id: sessionId,
			userId: user.id,
			secretHash: sessionSecretHash,
		});

		await this.userRepository.save(user, { passwordHash });
		await this.sessionRepository.save(session);

		return {
			user,
			session,
			sessionToken,
		};
	}
}
