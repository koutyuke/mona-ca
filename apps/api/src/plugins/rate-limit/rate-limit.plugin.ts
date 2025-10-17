import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";
import { getIP } from "../../lib/utils";
import { ElysiaWithEnv, ErrorResponseSchema } from "../elysia-with-env";
import { BadRequestException, TooManyRequestsException } from "../error";

type LimiterConfig = {
	maxTokens: number;
	refillRate: number;
	refillInterval: {
		value: number;
		unit: "ms" | "s" | "m" | "h" | "d";
	};
};

type ClientMeta = {
	ip?: string;
	country?: string;
	userAgent?: string;
};

const cache = new Map();

/**
 * Creates a rate limiter plugin for the Elysia framework.
 *
 * @param prefix - A string prefix used for namespacing the rate limiter keys.
 * @param config - Configuration object for the rate limiter.
 * @param config.refillRate - The rate at which tokens are refilled.
 * @param config.maxTokens - The maximum number of tokens available.
 * @param config.interval - The interval at which tokens are refilled.
 * @param config.interval.value - The value of the interval.
 * @param config.interval.unit - The unit of the interval (e.g., seconds, minutes).
 *
 * @throws {BadRequestException} - If the IP address is not found in the request headers.
 * @throws {TooManyRequestsException} - If the rate limit is exceeded.
 *
 * @example
 * new Elysia()
 *    .use(rateLimit("foo", {
 *      refillRate: 1,
 *      maxTokens: 5,
 *      interval: {
 *        value: 1,
 *        unit: "m",
 *      },
 *    }))
 *  });
 */
export const rateLimit = (prefix: string, { refillRate, maxTokens, refillInterval }: LimiterConfig) => {
	const plugin = new ElysiaWithEnv({
		name: "@mona-ca/rate-limiter",
		seed: {
			prefix,
			refillRate,
			maxTokens,
			interval: refillInterval,
		},
	}).derive({ as: "scoped" }, async ({ request, env }) => {
		const ip = getIP(request.headers);

		if (!ip) {
			throw new BadRequestException({
				message: "IP address not found",
			});
		}

		const rateLimit = new Ratelimit({
			redis: Redis.fromEnv(env),
			limiter: Ratelimit.tokenBucket(refillRate, `${refillInterval.value} ${refillInterval.unit}`, maxTokens),
			analytics: true,
			prefix,
			ephemeralCache: cache,
		});

		const country = request.headers.get("cf-ipcountry");
		const userAgent = request.headers.get("user-agent");

		const clientMeta: ClientMeta = {};

		if (ip) {
			clientMeta.ip = ip;
		}

		if (country) {
			clientMeta.country = country;
		}

		if (userAgent) {
			clientMeta.userAgent = userAgent;
		}

		const consume = async (key: string, cost: number) => {
			const { success, reset } = await rateLimit.limit(key, {
				...clientMeta,
				rate: cost,
			});

			if (!success) {
				throw new TooManyRequestsException(reset);
			}
		};

		return {
			ip,
			rateLimit: {
				consume,
			},
		};
	});

	return plugin;
};

export const RateLimiterSchema = {
	response: {
		429: ErrorResponseSchema("TOO_MANY_REQUESTS"),
	},
};
