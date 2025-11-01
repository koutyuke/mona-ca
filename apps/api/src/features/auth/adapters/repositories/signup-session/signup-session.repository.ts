import { eq } from "drizzle-orm";
import { newSignupSessionId } from "../../../domain/value-objects/ids";

import type { DrizzleService } from "../../../../../core/infra/drizzle";
import type { ISignupSessionRepository } from "../../../application/ports/repositories/signup-session.repository.interface";
import type { SignupSession } from "../../../domain/entities/signup-session";
import type { SignupSessionId } from "../../../domain/value-objects/ids";

interface FoundSignupSessionDto {
	id: string;
	email: string;
	emailVerified: boolean;
	code: string;
	secretHash: Buffer;
	expiresAt: Date;
}

export class SignupSessionRepository implements ISignupSessionRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findById(id: SignupSessionId): Promise<SignupSession | null> {
		const signupSessions = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.signupSessions)
			.where(eq(this.drizzleService.schema.signupSessions.id, id));

		if (signupSessions.length > 1) {
			throw new Error("Multiple signup sessions found for the same id");
		}

		return signupSessions.length === 1 ? this.convertToSignupSession(signupSessions[0]!) : null;
	}

	public async save(signupSession: SignupSession): Promise<void> {
		await this.drizzleService.db
			.insert(this.drizzleService.schema.signupSessions)
			.values({
				id: signupSession.id,
				email: signupSession.email,
				emailVerified: signupSession.emailVerified,
				code: signupSession.code,
				secretHash: Buffer.from(signupSession.secretHash),
				expiresAt: signupSession.expiresAt,
			})
			.onConflictDoUpdate({
				target: this.drizzleService.schema.signupSessions.id,
				set: {
					emailVerified: signupSession.emailVerified,
					expiresAt: signupSession.expiresAt,
				},
			});
	}

	public async deleteById(id: SignupSessionId): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.signupSessions)
			.where(eq(this.drizzleService.schema.signupSessions.id, id))
			.execute();
	}

	public async deleteByEmail(email: string): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.signupSessions)
			.where(eq(this.drizzleService.schema.signupSessions.email, email))
			.execute();
	}

	private convertToSignupSession(dto: FoundSignupSessionDto): SignupSession {
		return {
			id: newSignupSessionId(dto.id),
			email: dto.email,
			emailVerified: dto.emailVerified,
			code: dto.code,
			secretHash: new Uint8Array(dto.secretHash),
			expiresAt: dto.expiresAt,
		};
	}
}
