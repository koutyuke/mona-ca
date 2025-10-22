/**
 * Reference Repository:
 *
 * Elysia CORS Plugin: https://github.com/elysiajs/elysia-cors
 *
 * @pilcrowOnPaper/oslo/request: https://github.com/pilcrowOnPaper/oslo/tree/main/src/request
 */

import { type Context, Elysia, type HTTPMethod } from "elysia";
import { type PublicEnv, env } from "../../core/infra/config/env";

export type Origin = string | RegExp;

export interface CORSConfig {
	origin?: boolean | ((app_env: PublicEnv["APP_ENV"]) => Origin[]);

	methods?: boolean | HTTPMethod[];

	allowedHeaders?: boolean | string[];

	exposeHeaders?: boolean | string[];

	credentials?: boolean;
}

const processHeaders = (headers: Headers) => {
	let keys = "";

	headers.forEach((_, key) => {
		keys += `${key}, `;
	});

	if (keys) keys = keys.slice(0, -1);

	return keys;
};

const safeURL = (url: URL | string): URL | null => {
	try {
		return new URL(url);
	} catch {
		return null;
	}
};

const processOrigin = (originPattern: Origin, origin: string): boolean => {
	if (typeof originPattern === "string") {
		const originHost = safeURL(origin)?.host ?? null;
		const patternHost =
			safeURL(
				originPattern.startsWith("http://") || originPattern.startsWith("https://")
					? originPattern
					: `https://${originPattern}`,
			)?.host ?? null;
		if (originHost && originHost === patternHost) {
			return true;
		}
	}

	if (originPattern instanceof RegExp) {
		return originPattern.test(origin);
	}

	return false;
};

export const cors = (config?: CORSConfig) => {
	const {
		origin = true,
		methods = true,
		allowedHeaders = true,
		exposeHeaders = true,
		credentials = true,
	}: CORSConfig = config ?? {};

	const flattenAllowedHeaders = typeof allowedHeaders === "boolean" ? allowedHeaders : allowedHeaders.join(", ");

	const flattenExposeHeaders = typeof exposeHeaders === "boolean" ? exposeHeaders : exposeHeaders.join(", ");

	const flattenMethod = typeof methods === "boolean" ? methods : !methods.length ? false : methods.join(", ");

	const handleOrigin = (set: Context["set"], request: Request, app_env: PublicEnv["APP_ENV"]) => {
		if (origin === false) {
			return;
		}

		if (origin === true) {
			set.headers.Vary = "*";
			set.headers["access-control-allow-origin"] = request.headers.get("Origin") || "*";
			return;
		}

		const origins = origin(app_env);

		if (origins.includes("*")) {
			set.headers.Vary = "*";
			set.headers["access-control-allow-origin"] = "*";
			return;
		}

		if (origins.length) {
			const from = request.headers.get("Origin") ?? "";

			for (const origin of origins) {
				if (processOrigin(origin, from) === true) {
					set.headers.Vary = origin ? "Origin" : "*";
					set.headers["access-control-allow-origin"] = from || "*";
					return;
				}
			}
		}

		set.headers.Vary = "Origin";
	};

	const handleMethod = (set: Context["set"], method: string) => {
		if (!flattenMethod) {
			return;
		}

		if (flattenMethod === true) {
			set.headers["access-control-allow-methods"] = method ?? "*";
			return;
		}

		set.headers["access-control-allow-methods"] = flattenMethod;
	};

	const app = new Elysia({
		name: "@mona-ca/cors",
		aot: false,
	});

	return app
		.options("/*", ({ set }) => {
			set.headers["access-control-max-age"] = "5";

			return new Response(null, {
				status: 204,
			});
		})
		.onRequest(({ set, request }) => {
			handleOrigin(set, request, env.APP_ENV);
			handleMethod(set, request.method);

			if (flattenAllowedHeaders || flattenExposeHeaders) {
				const headers = processHeaders(request.headers);

				if (flattenAllowedHeaders) {
					set.headers["access-control-allow-headers"] =
						flattenAllowedHeaders === true ? headers : flattenAllowedHeaders;
				}

				if (flattenExposeHeaders) {
					set.headers["access-control-expose-headers"] = flattenExposeHeaders === true ? headers : flattenExposeHeaders;
				}
			}

			if (credentials === true) {
				set.headers["access-control-allow-credentials"] = "true";
			}
		});
};
