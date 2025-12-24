import type { DrizzleService } from "../infra/drizzle";
import type { IEmailGateway, ITurnstileGateway } from "../ports/gateways";
import type { ICryptoRandomService, IHmacService, IPasswordHashingService, ITokenSecretService } from "../ports/system";

export interface ICoreDIContainer {
	readonly drizzleService: DrizzleService;
	readonly tokenSecretService: ITokenSecretService;
	readonly passwordHashingService: IPasswordHashingService;
	readonly cryptoRandomService: ICryptoRandomService;
	readonly hmacService: IHmacService;
	readonly emailGateway: IEmailGateway;
	readonly turnstileGateway: ITurnstileGateway;
}
