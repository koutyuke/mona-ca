import { CLIENT_PLATFORM_HEADER_NAME, CONTENT_TYPE_HEADER_NAME, getAPIBaseURL } from "@mona-ca/core/http";
import { treaty } from "@elysiajs/eden";

import type { App } from "@mona-ca/api";
import type { ContentType } from "@mona-ca/core/http";
import type { Treaty } from "@elysiajs/eden";

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
