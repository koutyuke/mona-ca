import { eq, lte } from "drizzle-orm";
import { EmailVerification } from "../../../domain/entities";
import { type UserId, newEmailVerificationId, newUserId } from "../../../domain/value-object";
import type { DrizzleService } from "../../../infrastructure/drizzle";
import type { IEmailVerificationRepository } from "./interfaces/email-verification.repository.interface";

interface FoundEmailVerificationDto {
	id: string;
	email: string;
	userId: string;
	code: string;
	expiresAt: Date;
}

export class EmailVerificationRepository implements IEmailVerificationRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findByUserId(userId: UserId): Promise<EmailVerification | null> {
		const emailVerifications = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.emailVerifications)
			.where(eq(this.drizzleService.schema.emailVerifications.userId, userId));

		if (emailVerifications.length > 1) {
			throw new Error("Multiple email verifications found for the same user id");
		}

		return emailVerifications.length === 1 ? this.convertToEmailVerification(emailVerifications[0]!) : null;
	}

	public async save(emailVerification: EmailVerification): Promise<void> {
		await this.drizzleService.db
			.insert(this.drizzleService.schema.emailVerifications)
			.values(emailVerification)
			.onConflictDoUpdate({
				target: this.drizzleService.schema.emailVerifications.id,
				set: {
					email: emailVerification.email,
					userId: emailVerification.userId,
					code: emailVerification.code,
					expiresAt: emailVerification.expiresAt,
				},
			});
	}

	public async deleteByUserId(userId: UserId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.emailVerifications)
			.where(eq(this.drizzleService.schema.emailVerifications.userId, userId));
	}

	public async deleteExpiredVerifications(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.emailVerifications)
			.where(lte(this.drizzleService.schema.emailVerifications.expiresAt, new Date()));
	}

	private convertToEmailVerification(dto: FoundEmailVerificationDto): EmailVerification {
		return new EmailVerification({
			id: newEmailVerificationId(dto.id),
			email: dto.email,
			userId: newUserId(dto.userId),
			code: dto.code,
			expiresAt: dto.expiresAt,
		});
	}
}
