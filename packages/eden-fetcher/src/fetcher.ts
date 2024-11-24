import { treaty } from "@elysiajs/eden";
import type { App } from "@mona-ca/api";
import { getAPIBaseUrl } from "@mona-ca/core/utils";

export const createEdenFetcher = (production: boolean) => treaty<App>(getAPIBaseUrl(production).toString());
