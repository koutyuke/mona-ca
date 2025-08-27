import { type Treaty, treaty } from "@elysiajs/eden";
import type { App } from "@mona-ca/api";
import { getAPIBaseURL } from "@mona-ca/core/utils";

export const createEdenFetch = (production: boolean, config?: Treaty.Config) =>
	treaty<App>(getAPIBaseURL(production).toString(), config);
