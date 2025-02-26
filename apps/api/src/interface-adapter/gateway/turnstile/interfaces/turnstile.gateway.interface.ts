export type TurnstileErrorCodes =
	| "missing-input-secret"
	| "invalid-input-secret"
	| "missing-input-response"
	| "invalid-input-response"
	| "bad-request"
	| "timeout-or-duplicate"
	| "internal-error";

export type TurnstileResult =
	| {
			success: false;
			"error-codes": TurnstileErrorCodes[];
	  }
	| {
			success: true;
			"error-codes": [];
			challenge_ts: string;
			hostname: string;
			action: string;
			cdata: string;
			idempotency_key?: string;
			metadata?: {
				interaction?: boolean;
			};
	  };

export interface ITurnstileGateway {
	verify(token: string, ipAddress: string): Promise<TurnstileResult>;
}
