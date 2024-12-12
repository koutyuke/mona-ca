import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";
import { getIP } from "../../common/utils";
import { ElysiaWithEnv } from "../elysia-with-env";
import { BadRequestException } from "../error/exceptions";

type LimiterConfig = {
	refillRate: number;
	maxTokens: number;
	interval: {
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
 * @returns An instance of the Elysia plugin configured with rate limiting.
 *
 * @example
 * new Elysia()
 *    .use(rateLimiter("foo", {
 *      refillRate: 1,
 *      maxTokens: 5,
 *      interval: {
 *        value: 1,
 *        unit: "m",
 *      },
 *    }))
 *  });
 */
const rateLimiter = (prefix: string, { refillRate, maxTokens, interval }: LimiterConfig) => {
	const plugin = new ElysiaWithEnv({
		name: "@mona-ca/rate-limiter",
		seed: {
			prefix,
			refillRate,
			maxTokens,
			interval,
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
			limiter: Ratelimit.tokenBucket(refillRate, `${interval.value} ${interval.unit}`, maxTokens),
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
			const { success, limit, remaining, reset } = await rateLimit.limit(key, {
				...clientMeta,
				rate: cost,
			});

			return { success, limit, remaining, reset };
		};

		return {
			ip,
			rateLimiter: {
				consume,
			},
		};
	});

	return plugin;
};

export { rateLimiter };
