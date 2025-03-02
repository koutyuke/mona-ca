import { and, eq, lte } from "drizzle-orm";
import { EmailVerificationCode } from "../../../domain/entities";
import type { DrizzleService } from "../../../infrastructure/drizzle";
import type { IEmailVerificationCodeRepository } from "./interfaces/email-verification-code.repository.interface";

export class EmailVerificationCodeRepository implements IEmailVerificationCodeRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findByUserId(userId: EmailVerificationCode["userId"]): Promise<EmailVerificationCode | null> {
		const emailVerificationCodes = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.emailVerificationCodes)
			.where(eq(this.drizzleService.schema.emailVerificationCodes.userId, userId));

		if (emailVerificationCodes.length === 0) {
			return null;
		}

		return new EmailVerificationCode(emailVerificationCodes[0]!);
	}

	public async create(
		emailVerificationCode: ConstructorParameters<typeof EmailVerificationCode>[0],
	): Promise<EmailVerificationCode> {
		const emailVerificationCodes = await this.drizzleService.db
			.insert(this.drizzleService.schema.emailVerificationCodes)
			.values(emailVerificationCode)
			.returning();

		if (emailVerificationCodes.length !== 1) {
			throw new Error("Failed to create EmailVerificationCode");
		}

		return new EmailVerificationCode(emailVerificationCodes[0]!);
	}

	public async delete(conditions?: {
		email?: EmailVerificationCode["email"];
		userId?: EmailVerificationCode["userId"];
	}): Promise<void> {
		if (!conditions || (!conditions.email && !conditions.userId)) {
			await this.drizzleService.db.delete(this.drizzleService.schema.emailVerificationCodes);
			return;
		}

		const { email, userId } = conditions;

		await this.drizzleService.db
			.delete(this.drizzleService.schema.emailVerificationCodes)
			.where(
				and(
					email ? eq(this.drizzleService.schema.emailVerificationCodes.email, email) : undefined,
					userId ? eq(this.drizzleService.schema.emailVerificationCodes.userId, userId) : undefined,
				),
			);
	}

	public async deleteExpiredCodes(): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.emailVerificationCodes)
			.where(lte(this.drizzleService.schema.emailVerificationCodes.expiresAt, new Date()));
	}
}
