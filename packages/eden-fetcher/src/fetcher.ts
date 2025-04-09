import { treaty } from "@elysiajs/eden";
import type { App } from "@mona-ca/api";
import { getAPIBaseURL } from "@mona-ca/core/utils";

export const createEdenFetcher = (production: boolean) => treaty<App>(getAPIBaseURL(production).toString());
