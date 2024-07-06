import type { AppStatusEnv } from "../env";

export type HTTPMethod =
	| "ACL"
	| "BIND"
	| "CHECKOUT"
	| "CONNECT"
	| "COPY"
	| "DELETE"
	| "GET"
	| "HEAD"
	| "LINK"
	| "LOCK"
	| "M-SEARCH"
	| "MERGE"
	| "MKACTIVITY"
	| "MKCALENDAR"
	| "MKCOL"
	| "MOVE"
	| "NOTIFY"
	| "OPTIONS"
	| "PATCH"
	| "POST"
	| "PROPFIND"
	| "PROPPATCH"
	| "PURGE"
	| "PUT"
	| "REBIND"
	| "REPORT"
	| "SEARCH"
	| "SOURCE"
	| "SUBSCRIBE"
	| "TRACE"
	| "UNBIND"
	| "UNLINK"
	| "UNLOCK"
	| "UNSUBSCRIBE";

export type Origin = string | RegExp;

export interface CORSConfig {
	origin?: boolean | ((app_env: AppStatusEnv["APP_ENV"]) => Origin[]);

	methods?: boolean | HTTPMethod[];

	allowedHeaders?: boolean | string[];

	exposeHeaders?: boolean | string[];

	credentials?: boolean;
}
