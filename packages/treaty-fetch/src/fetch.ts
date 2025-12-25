import { type Treaty, treaty } from "@elysiajs/eden";
import type { App } from "@mona-ca/api";
import {
	CLIENT_PLATFORM_HEADER_NAME,
	CONTENT_TYPE_HEADER_NAME,
	type ContentType,
	getAPIBaseURL,
} from "@mona-ca/core/http";

export const createTreatyFetch = (
	production: boolean,
	config?: {
		platform?: "web" | "mobile";
		contentType?: ContentType;
		treaty?: Treaty.Config;
	},
) => {
	const treatyConfig: Treaty.Config = config?.treaty ?? {};

	if (config?.platform) {
		treatyConfig.headers = {
			[CLIENT_PLATFORM_HEADER_NAME]: config?.platform,
			...treatyConfig.headers,
		};
	}

	if (config?.contentType) {
		treatyConfig.headers = {
			[CONTENT_TYPE_HEADER_NAME]: config?.contentType,
			...treatyConfig.headers,
		};
	}

	return treaty<App>(getAPIBaseURL(production).toString(), treatyConfig);
};
