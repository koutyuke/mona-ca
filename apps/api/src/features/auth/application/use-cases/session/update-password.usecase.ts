import { err, ok } from "@mona-ca/core/utils";
import { ulid } from "../../../../../core/lib/id";
import { createSession } from "../../../domain/entities/session";
import { updateUserCredentials } from "../../../domain/entities/user-credentials";
import { newSessionId } from "../../../domain/value-objects/ids";
import { encodeToken } from "../../../domain/value-objects/tokens";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { IPasswordHashingService, ITokenSecretService } from "../../../../../core/ports/system";
import type { Session } from "../../../domain/entities/session";
import type { UserCredentials } from "../../../domain/entities/user-credentials";
import type { SessionToken } from "../../../domain/value-objects/tokens";
import type {
	IUpdatePasswordUseCase,
	UpdatePasswordUseCaseResult,
} from "../../contracts/session/update-password.usecase.interface";
import type { IAuthUserRepository } from "../../ports/repositories/auth-user.repository.interface";
import type { ISessionRepository } from "../../ports/repositories/session.repository.interface";

export class UpdatePasswordUseCase implements IUpdatePasswordUseCase {
	constructor(
		// repositories
		private readonly authUserRepository: IAuthUserRepository,
		private readonly sessionRepository: ISessionRepository,
		// system
		private readonly passwordHashingService: IPasswordHashingService,
		private readonly tokenSecretService: ITokenSecretService,
	) {}

	public async execute(
		userCredentials: UserCredentials,
		currentPassword: string | null,
		newPassword: string,
	): Promise<UpdatePasswordUseCaseResult> {
		if (!userCredentials.passwordHash) {
			if (currentPassword) {
				return err("INVALID_CURRENT_PASSWORD");
			}
		} else {
			if (!currentPassword) {
				return err("INVALID_CURRENT_PASSWORD");
			}

			const verifyPasswordResult = await this.passwordHashingService.verify(
				currentPassword,
				userCredentials.passwordHash,
			);
			if (!verifyPasswordResult) {
				return err("INVALID_CURRENT_PASSWORD");
			}
		}

		const [newPasswordHash] = await Promise.all([
			this.passwordHashingService.hash(newPassword),

			// Delete all sessions of the user.
			this.sessionRepository.deleteByUserId(userCredentials.id),
		]);

		// Generate a new session.
		const { session, sessionToken } = this.createSession(userCredentials.id);

		const updatedUserCredentials = updateUserCredentials(userCredentials, {
			passwordHash: newPasswordHash,
		});

		await Promise.all([this.authUserRepository.update(updatedUserCredentials), this.sessionRepository.save(session)]);

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
		const sessionToken = encodeToken(id, secret);
		const session = createSession({
			id,
			userId,
			secretHash: secretHash,
		});
		return { session, sessionToken };
	}
}
