// reference repository: https://github.com/elysiajs/elysia-cors

import type { Context } from "elysia";
import { ElysiaWithEnv } from "../elysiaWithEnv";
import type { AppStatusEnv } from "../env";
import type { CORSConfig, Origin } from "./cors.type";

const processHeaders = (headers: Headers) => {
	let keys = "";

	headers.forEach((_, key) => {
		keys += `${key}, `;
	});

	if (keys) keys = keys.slice(0, -1);

	return keys;
};

const processOrigin = (origin: Origin, from: string): boolean => {
	if (typeof origin === "string") {
		if (origin.indexOf("://") === -1) {
			return from.includes(origin);
		}
		return origin === from;
	}

	if (origin instanceof RegExp) {
		return origin.test(from);
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

	const handleOrigin = (set: Context["set"], request: Request, app_env: AppStatusEnv["APP_ENV"]) => {
		if (origin === false) {
			return;
		}

		if (origin === true) {
			set.headers.Vary = "*";
			set.headers["Access-Control-Allow-Origin"] = request.headers.get("Origin") || "*";
			return;
		}

		const origins = origin(app_env);

		if (origins.includes("*")) {
			set.headers.Vary = "*";
			set.headers["Access-Control-Allow-Origin"] = "*";
			return;
		}

		if (origins.length) {
			const from = request.headers.get("Origin") ?? "";

			for (const origin of origins) {
				if (processOrigin(origin, from) === true) {
					set.headers.Vary = origin ? "Origin" : "*";
					set.headers["Access-Control-Allow-Origin"] = from || "*";
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
			set.headers["Access-Control-Allow-Methods"] = method ?? "*";
			return;
		}

		set.headers["Access-Control-Allow-Methods"] = flattenMethod;
	};

	const app = new ElysiaWithEnv({
		name: "@mona-ca/cors",
		aot: false,
	});

	return app
		.options("/*", ({ set }) => {
			set.headers["Access-Control-Max-Age"] = "5";

			return new Response(null, {
				status: 204,
			});
		})
		.onRequest(({ set, request, env: { APP_ENV } }) => {
			handleOrigin(set, request, APP_ENV);
			handleMethod(set, request.method);

			if (flattenAllowedHeaders || flattenExposeHeaders) {
				const headers = processHeaders(request.headers);

				if (flattenAllowedHeaders) {
					set.headers["Access-Control-Allow-Headers"] =
						flattenAllowedHeaders === true ? headers : flattenAllowedHeaders;
				}

				if (flattenExposeHeaders) {
					set.headers["Access-Control-Expose-Headers"] = flattenExposeHeaders === true ? headers : flattenExposeHeaders;
				}
			}

			if (credentials === true) {
				set.headers["Access-Control-Allow-Credentials"] = "true";
			}
		});
};
