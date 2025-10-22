import { EmailGateway } from "../adapters/gateways/email";
import { TurnstileGateway } from "../adapters/gateways/turnstile";
import type { CloudflareBindings, EnvVariables } from "../infra/config/env";
import { HmacSha256, PasswordHasher, RandomGenerator, SessionSecretHasher } from "../infra/crypto";
import { DrizzleService } from "../infra/drizzle";
import type { IEmailGateway, ITurnstileGateway } from "../ports/gateways";
import type { IMac, IPasswordHasher, IRandomGenerator, ISessionSecretHasher } from "../ports/system";

export interface ICoreDIContainer {
	readonly drizzleService: DrizzleService;
	readonly sessionSecretHasher: ISessionSecretHasher;
	readonly passwordHasher: IPasswordHasher;
	readonly randomGenerator: IRandomGenerator;
	readonly hmacSha256: IMac;
	readonly emailGateway: IEmailGateway;
	readonly turnstileGateway: ITurnstileGateway;
}

/**
 * SharedDIContainer
 *
 * 共通のインフラストラクチャコンポーネントをSingletonとして管理するDIコンテナ
 * グローバルスコープで初期化され、全featureで共有される
 *
 * @remarks
 * - cloudflare:workersのenvを使用してインスタンスを生成
 * - グローバルスコープでインスタンス生成のみ実行（I/O操作なし）
 */
export class CoreDIContainer implements ICoreDIContainer {
	private readonly envVariables: EnvVariables;
	private readonly cloudflareBindings: CloudflareBindings;

	// Infrastructure
	private _drizzleService: DrizzleService | undefined;
	private _sessionSecretHasher: ISessionSecretHasher | undefined;
	private _passwordHasher: IPasswordHasher | undefined;
	private _randomGenerator: IRandomGenerator | undefined;
	private _hmacSha256: IMac | undefined;

	// Gateways
	private _emailGateway: IEmailGateway | undefined;
	private _turnstileGateway: ITurnstileGateway | undefined;

	constructor(
		envVariables: EnvVariables,
		cloudflareBindings: CloudflareBindings,
		override?: Partial<ICoreDIContainer>,
	) {
		this.envVariables = envVariables;
		this.cloudflareBindings = cloudflareBindings;

		const overrides = override ?? {};

		// Infrastructure
		if (overrides.drizzleService) {
			this._drizzleService = overrides.drizzleService;
		}
		if (overrides.sessionSecretHasher) {
			this._sessionSecretHasher = overrides.sessionSecretHasher;
		}
		if (overrides.passwordHasher) {
			this._passwordHasher = overrides.passwordHasher;
		}
		if (overrides.randomGenerator) {
			this._randomGenerator = overrides.randomGenerator;
		}
		if (overrides.hmacSha256) {
			this._hmacSha256 = overrides.hmacSha256;
		}

		// Gateways
		if (overrides.emailGateway) {
			this._emailGateway = overrides.emailGateway;
		}
		if (overrides.turnstileGateway) {
			this._turnstileGateway = overrides.turnstileGateway;
		}
	}

	get drizzleService(): DrizzleService {
		if (!this._drizzleService) {
			this._drizzleService = new DrizzleService(this.cloudflareBindings.DB);
		}
		return this._drizzleService;
	}

	get sessionSecretHasher(): ISessionSecretHasher {
		if (!this._sessionSecretHasher) {
			this._sessionSecretHasher = new SessionSecretHasher();
		}
		return this._sessionSecretHasher;
	}

	get passwordHasher(): IPasswordHasher {
		if (!this._passwordHasher) {
			this._passwordHasher = new PasswordHasher(this.envVariables.PASSWORD_PEPPER);
		}
		return this._passwordHasher;
	}

	get randomGenerator(): IRandomGenerator {
		if (!this._randomGenerator) {
			this._randomGenerator = new RandomGenerator();
		}
		return this._randomGenerator;
	}

	get hmacSha256(): IMac {
		if (!this._hmacSha256) {
			this._hmacSha256 = new HmacSha256(this.envVariables.OAUTH_STATE_HMAC_SECRET);
		}
		return this._hmacSha256;
	}

	get emailGateway(): IEmailGateway {
		if (!this._emailGateway) {
			this._emailGateway = new EmailGateway(
				this.envVariables.APP_ENV === "production",
				this.envVariables.RESEND_API_KEY,
			);
		}
		return this._emailGateway;
	}

	get turnstileGateway(): ITurnstileGateway {
		if (!this._turnstileGateway) {
			this._turnstileGateway = new TurnstileGateway(this.envVariables.CF_TURNSTILE_SECRET);
		}
		return this._turnstileGateway;
	}
}
