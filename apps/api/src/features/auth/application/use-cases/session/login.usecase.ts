import { err, ok } from "@mona-ca/core/utils";
import { ulid } from "../../../../../core/lib/id";
import { createSession } from "../../../domain/entities/session";
import { newSessionId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { IPasswordHashingService, ITokenSecretService } from "../../../../../core/ports/system";
import type { Session } from "../../../domain/entities/session";
import type { SessionToken } from "../../../domain/value-objects/tokens";
import type { ILoginUseCase, LoginUseCaseResult } from "../../contracts/session/login.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";

export class LoginUseCase implements ILoginUseCase {
	constructor(
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly sessionRepository: ISessionRepository,
		// system
		private readonly passwordHashingService: IPasswordHashingService,
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(email: string, password: string): Promise<LoginUseCaseResult> {
		const userCredentials = await this.authUserRepository.findByEmail(email);

		if (!userCredentials || !userCredentials.passwordHash) {
			return err("INVALID_CREDENTIALS");
		}

		const verifyPasswordResult = await this.passwordHashingService.verify(password, userCredentials.passwordHash);

		if (!verifyPasswordResult) {
			return err("INVALID_CREDENTIALS");
		}

		const { session, sessionToken } = this.createSession(userCredentials.id);

		await this.sessionRepository.save(session);

		return ok({
			session,
			sessionToken,
		});
	}

	private createSession(userId: UserId): {
		session: Session;
		sessionToken: SessionToken;
	} {
		const id = newSessionId(ulid());
		const secret = this.tokenSecretService.generateSecret();
		const secretHash = this.tokenSecretService.hash(secret);

		const session = createSession({
			id: id,
			userId,
			secretHash: secretHash,
		});
		const sessionToken = encodeToken(id, secret);
		return { session, sessionToken };
	}
}
