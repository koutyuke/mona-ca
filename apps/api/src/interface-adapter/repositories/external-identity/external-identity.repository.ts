import type { ToPrimitive } from "@mona-ca/core/utils";
import { and, eq } from "drizzle-orm";
import type { IExternalIdentityRepository } from "../../../application/ports/out/repositories";
import type { ExternalIdentity } from "../../../domain/entities";
import {
	type ExternalIdentityProvider,
	type ExternalIdentityProviderUserId,
	type UserId,
	newExternalIdentityProvider,
	newExternalIdentityProviderUserId,
	newUserId,
} from "../../../domain/value-objects";
import type { DrizzleService } from "../../../infrastructure/drizzle";

interface FoundExternalIdentityDto {
	provider: ToPrimitive<ExternalIdentityProvider>;
	providerUserId: string;
	userId: string;
	linkedAt: Date;
}

export class ExternalIdentityRepository implements IExternalIdentityRepository {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async findByUserId(userId: UserId): Promise<ExternalIdentity[]> {
		const externalIdentities = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.externalIdentities)
			.where(eq(this.drizzleService.schema.externalIdentities.userId, userId));

		return externalIdentities.map(this.convertToExternalIdentity);
	}

	public async findByUserIdAndProvider(
		userId: UserId,
		provider: ExternalIdentityProvider,
	): Promise<ExternalIdentity | null> {
		const externalIdentities = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.externalIdentities)
			.where(
				and(
					eq(this.drizzleService.schema.externalIdentities.userId, userId),
					eq(this.drizzleService.schema.externalIdentities.provider, provider),
				),
			);

		if (externalIdentities.length > 1) {
			throw new Error("Multiple external identities found for the same user and provider");
		}

		return externalIdentities.length === 1 ? this.convertToExternalIdentity(externalIdentities[0]!) : null;
	}

	public async findByProviderAndProviderUserId(
		provider: ExternalIdentityProvider,
		providerUserId: ExternalIdentityProviderUserId,
	): Promise<ExternalIdentity | null> {
		const externalIdentities = await this.drizzleService.db
			.select()
			.from(this.drizzleService.schema.externalIdentities)
			.where(
				and(
					eq(this.drizzleService.schema.externalIdentities.providerUserId, providerUserId),
					eq(this.drizzleService.schema.externalIdentities.provider, provider),
				),
			);

		if (externalIdentities.length > 1) {
			throw new Error("Multiple external identities found for the same provider and providerUserId");
		}

		return externalIdentities.length === 1 ? this.convertToExternalIdentity(externalIdentities[0]!) : null;
	}

	public async save(externalIdentity: ExternalIdentity): Promise<void> {
		await this.drizzleService.db
			.insert(this.drizzleService.schema.externalIdentities)
			.values(externalIdentity)
			.onConflictDoNothing({
				target: [
					this.drizzleService.schema.externalIdentities.provider,
					this.drizzleService.schema.externalIdentities.providerUserId,
				],
			})
			.onConflictDoNothing();
	}

	public async deleteByUserIdAndProvider(userId: UserId, provider: ExternalIdentityProvider): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.externalIdentities)
			.where(
				and(
					eq(this.drizzleService.schema.externalIdentities.userId, userId),
					eq(this.drizzleService.schema.externalIdentities.provider, provider),
				),
			);
	}

	public async deleteByProviderAndProviderUserId(
		provider: ExternalIdentityProvider,
		providerUserId: ExternalIdentityProviderUserId,
	): Promise<void> {
		await this.drizzleService.db
			.delete(this.drizzleService.schema.externalIdentities)
			.where(
				and(
					eq(this.drizzleService.schema.externalIdentities.providerUserId, providerUserId),
					eq(this.drizzleService.schema.externalIdentities.provider, provider),
				),
			);
	}

	private convertToExternalIdentity(dto: FoundExternalIdentityDto): ExternalIdentity {
		return {
			provider: newExternalIdentityProvider(dto.provider),
			providerUserId: newExternalIdentityProviderUserId(dto.providerUserId),
			userId: newUserId(dto.userId),
			linkedAt: dto.linkedAt,
		} satisfies ExternalIdentity;
	}
}
