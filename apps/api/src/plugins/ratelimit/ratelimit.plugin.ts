import { type Err, type Ok, type Result, err, ok } from "@mona-ca/core/result";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis/cloudflare";
import Elysia from "elysia";
import { env } from "../../core/infra/config/env";
import { ipAddressPlugin } from "../ip-address";

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

type ConsumeResult = Result<Ok, Err<"TOO_MANY_REQUESTS", { reset: number }>>;

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
 * @example
 * new Elysia()
 *    .use(ratelimit("foo", {
 *      refillRate: 1,
 *      maxTokens: 5,
 *      interval: {
 *        value: 1,
 *        unit: "m",
 *      },
 *    }))
 *  });
 */
export const ratelimitPlugin = (prefix: string, { refillRate, maxTokens, refillInterval }: LimiterConfig) =>
	new Elysia({
		name: "@mona-ca/ratelimit",
		seed: {
			prefix,
			refillRate,
			maxTokens,
			interval: refillInterval,
		},
	})
		.use(ipAddressPlugin())
		.decorate(
			"redisRatelimit",
			new Ratelimit({
				redis: Redis.fromEnv(env),
				limiter: Ratelimit.tokenBucket(refillRate, `${refillInterval.value} ${refillInterval.unit}`, maxTokens),
				analytics: true,
				prefix,
				ephemeralCache: cache,
			}),
		)
		.derive({ as: "scoped" }, async ({ request, ipAddress, redisRatelimit }) => {
			const country = request.headers.get("cf-ipcountry");
			const userAgent = request.headers.get("user-agent");

			const clientMeta: ClientMeta = {
				ip: ipAddress,
			};

			if (country) {
				clientMeta.country = country;
			}

			if (userAgent) {
				clientMeta.userAgent = userAgent;
			}

			const consume = async (key: string, cost: number): Promise<ConsumeResult> => {
				const { success, reset } = await redisRatelimit.limit(key, {
					...clientMeta,
					rate: cost,
				});

				if (!success) {
					return err("TOO_MANY_REQUESTS", { reset });
				}

				return ok();
			};

			return {
				rateLimit: {
					consume,
				},
			};
		});
