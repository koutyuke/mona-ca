import { sessionExpiresSpan } from "../../../common/constants";
import { ulid } from "../../../common/utils";
import { err } from "../../../common/utils";
import type { ISessionRepository } from "../../../interface-adapter/repositories/session";
import type { IUserRepository } from "../../../interface-adapter/repositories/user";
import type { IUserCredentialRepository } from "../../../interface-adapter/repositories/user-credential";
import type { IPasswordService } from "../../services/password";
import type { ISessionTokenService } from "../../services/session-token";
import type { ISignupUseCase, SignupUseCaseResult } from "./interfaces/signup.usecase.interface";

export class SignupUseCase implements ISignupUseCase {
	constructor(
		private readonly sessionRepository: ISessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly userCredentialRepository: IUserCredentialRepository,
		private readonly passwordService: IPasswordService,
		private readonly sessionTokenService: ISessionTokenService,
	) {}

	public async execute(
		name: string,
		email: string,
		password: string,
		gender: "man" | "woman",
	): Promise<SignupUseCaseResult> {
		const existingSameEmailUser = await this.userRepository.findByEmail(email); // check pre-register user

		if (existingSameEmailUser) {
			if (existingSameEmailUser.emailVerified) {
				return err("EMAIL_IS_ALREADY_USED");
			}

			await this.userRepository.delete(existingSameEmailUser.id);
		}

		const passwordHash = await this.passwordService.hashPassword(password);
		const sessionToken = this.sessionTokenService.generateSessionToken();

		const userId = ulid();
		const sessionId = this.sessionTokenService.hashSessionToken(sessionToken);

		const user = await this.userRepository.create({
			id: userId,
			name,
			email,
			emailVerified: false, // pre-register user
			iconUrl: null,
			gender,
		});

		const [session] = await Promise.all([
			this.sessionRepository.create({
				id: sessionId,
				userId,
				expiresAt: new Date(Date.now() + sessionExpiresSpan.milliseconds()),
			}),
			this.userCredentialRepository.create({
				userId,
				passwordHash,
			}),
		]);

		return {
			user,
			session,
			sessionToken,
		};
	}
}
