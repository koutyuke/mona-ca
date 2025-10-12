import { err, ulid } from "../../../common/utils";
import { createSession } from "../../../domain/entities";
import { formatSessionToken, newSessionId } from "../../../domain/value-object";
import { generateSessionSecret, hashSessionSecret, verifyPassword } from "../../../infrastructure/crypt";
import type { ILoginUseCase, LoginUseCaseResult } from "../../ports/in";
import type { ISessionRepository, IUserRepository } from "../../ports/out/repositories";

export class LoginUseCase implements ILoginUseCase {
	constructor(
		private readonly sessionRepository: ISessionRepository,
		private readonly userRepository: IUserRepository,
	) {}

	public async execute(email: string, password: string): Promise<LoginUseCaseResult> {
		const user = await this.userRepository.findByEmail(email);
		const passwordHash = user ? await this.userRepository.findPasswordHashById(user.id) : null;
		const verifyPasswordResult = passwordHash ? await verifyPassword(password, passwordHash) : false;

		if (!(user && passwordHash && verifyPasswordResult)) {
			return err("INVALID_CREDENTIALS");
		}

		const sessionSecret = generateSessionSecret();
		const sessionSecretHash = hashSessionSecret(sessionSecret);
		const sessionId = newSessionId(ulid());
		const sessionToken = formatSessionToken(sessionId, sessionSecret);
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
