import { type Treaty, treaty } from "@elysiajs/eden";
import type { App } from "@mona-ca/api";
import { getAPIBaseURL } from "@mona-ca/core/result";

export const createTreatyFetch = (production: boolean, config?: Treaty.Config) =>
	treaty<App>(getAPIBaseURL(production).toString(), config);
