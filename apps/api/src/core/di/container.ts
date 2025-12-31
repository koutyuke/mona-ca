import { EmailGateway } from "../adapters/gateways/email";
import { TurnstileGateway } from "../adapters/gateways/turnstile";
import { CryptoRandomService, HmacSha256Service, PasswordHashingService, TokenSecretService } from "../infra/crypto";
import { DrizzleService } from "../infra/drizzle";

import type { CloudflareBindings, EnvVariables } from "../infra/config/env";
import type { IEmailGateway, ITurnstileGateway } from "../ports/gateways";
import type { ICryptoRandomService, IHmacService, IPasswordHashingService, ITokenSecretService } from "../ports/system";
import type { ICoreDIContainer } from "./container.interface";

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
	private _tokenSecretService: ITokenSecretService | undefined;
	private _passwordHashingService: IPasswordHashingService | undefined;
	private _cryptoRandomService: ICryptoRandomService | undefined;
	private _hmacService: IHmacService | undefined;

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
		if (overrides.tokenSecretService) {
			this._tokenSecretService = overrides.tokenSecretService;
		}
		if (overrides.passwordHashingService) {
			this._passwordHashingService = overrides.passwordHashingService;
		}
		if (overrides.cryptoRandomService) {
			this._cryptoRandomService = overrides.cryptoRandomService;
		}
		if (overrides.hmacService) {
			this._hmacService = overrides.hmacService;
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

	get tokenSecretService(): ITokenSecretService {
		if (!this._tokenSecretService) {
			this._tokenSecretService = new TokenSecretService();
		}
		return this._tokenSecretService;
	}

	get passwordHashingService(): IPasswordHashingService {
		if (!this._passwordHashingService) {
			this._passwordHashingService = new PasswordHashingService(this.envVariables.PASSWORD_PEPPER);
		}
		return this._passwordHashingService;
	}

	get cryptoRandomService(): ICryptoRandomService {
		if (!this._cryptoRandomService) {
			this._cryptoRandomService = new CryptoRandomService();
		}
		return this._cryptoRandomService;
	}

	get hmacService(): IHmacService {
		if (!this._hmacService) {
			this._hmacService = new HmacSha256Service(this.envVariables.OAUTH_STATE_HMAC_SECRET);
		}
		return this._hmacService;
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
