import { eq, lte } from "drizzle-orm";
import { newUserId } from "../../../../../core/domain/value-objects";
import { newEmailVerificationRequestId } from "../../../domain/value-objects/ids";

import type { UserId } from "../../../../../core/domain/value-objects";
import type { DrizzleService } from "../../../../../core/infra/drizzle";
import type { IEmailVerificationRequestRepository } from "../../../application/ports/repositories/email-verification-request.repository.interface";
import type { EmailVerificationRequest } from "../../../domain/entities/email-verification-request";
import type { EmailVerificationRequestId } from "../../../domain/value-objects/ids";

interface FoundEmailVerificationRequestDto {
	id: string;
	email: string;
	userId: string;
	code: string;
	secretHash: Buffer;
	expiresAt: Date;
}

export class EmailVerificationRequestRepository implements IEmailVerificationRequestRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(id: EmailVerificationRequestId): Promise<EmailVerificationRequest | null> {
		const emailVerificationRequests = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.emailVerificationRequestsTable)
			.where(eq(this.drizzleService.schema.emailVerificationRequestsTable.id, id));

		if (emailVerificationRequests.length > 1) {
			throw new Error("Multiple email verifications found for the same user id");
		}

		return emailVerificationRequests.length === 1
			? this.convertToEmailVerificationRequest(emailVerificationRequests[0]!)
			: null;
	}

	public async save(emailVerificationRequest: EmailVerificationRequest): Promise<void> {
		await this.drizzleService.db
			.insert(this.drizzleService.schema.emailVerificationRequestsTable)
			.values({
				id: emailVerificationRequest.id,
				email: emailVerificationRequest.email,
				userId: emailVerificationRequest.userId,
				code: emailVerificationRequest.code,
				secretHash: Buffer.from(emailVerificationRequest.secretHash),
				expiresAt: emailVerificationRequest.expiresAt,
			})
			.onConflictDoUpdate({
				target: this.drizzleService.schema.emailVerificationRequestsTable.id,
				set: {
					email: emailVerificationRequest.email,
					userId: emailVerificationRequest.userId,
					code: emailVerificationRequest.code,
					secretHash: Buffer.from(emailVerificationRequest.secretHash),
					expiresAt: emailVerificationRequest.expiresAt,
				},
			});
	}

	public async deleteByUserId(userId: UserId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.emailVerificationRequestsTable)
			.where(eq(this.drizzleService.schema.emailVerificationRequestsTable.userId, userId))
			.execute();
	}

	public async deleteExpiredVerifications(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.emailVerificationRequestsTable)
			.where(lte(this.drizzleService.schema.emailVerificationRequestsTable.expiresAt, new Date()))
			.execute();
	}

	private convertToEmailVerificationRequest(dto: FoundEmailVerificationRequestDto): EmailVerificationRequest {
		return {
			id: newEmailVerificationRequestId(dto.id),
			email: dto.email,
			userId: newUserId(dto.userId),
			code: dto.code,
			secretHash: new Uint8Array(dto.secretHash),
			expiresAt: dto.expiresAt,
		} satisfies EmailVerificationRequest;
	}
}
