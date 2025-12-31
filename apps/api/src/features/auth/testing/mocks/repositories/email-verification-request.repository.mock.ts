import { isExpiredEmailVerificationRequest } from "../../../domain/entities/email-verification-request";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { IEmailVerificationRequestRepository } from "../../../application/ports/out/repositories/email-verification-request.repository.interface";
import type { EmailVerificationRequest } from "../../../domain/entities/email-verification-request";
import type { EmailVerificationRequestId } from "../../../domain/value-objects/ids";

export class EmailVerificationRequestRepositoryMock implements IEmailVerificationRequestRepository {
	private readonly emailVerificationRequestMap: Map<EmailVerificationRequestId, EmailVerificationRequest>;

	constructor(maps: {
		emailVerificationRequestMap: Map<EmailVerificationRequestId, EmailVerificationRequest>;
	}) {
		this.emailVerificationRequestMap = maps.emailVerificationRequestMap;
	}

	async findById(id: EmailVerificationRequestId): Promise<EmailVerificationRequest | null> {
		return this.emailVerificationRequestMap.get(id) || null;
	}

	async save(emailVerificationRequest: EmailVerificationRequest): Promise<void> {
		this.emailVerificationRequestMap.set(emailVerificationRequest.id, emailVerificationRequest);
	}

	async deleteByUserId(userId: UserId): Promise<void> {
		for (const [requestId, request] of this.emailVerificationRequestMap.entries()) {
			if (request.userId === userId) {
				this.emailVerificationRequestMap.delete(requestId);
			}
		}
	}

	async deleteExpiredVerifications(): Promise<void> {
		for (const [requestId, request] of this.emailVerificationRequestMap.entries()) {
			if (isExpiredEmailVerificationRequest(request)) {
				this.emailVerificationRequestMap.delete(requestId);
			}
		}
	}
}
