export type FetchHandlerEnv = {
	DB: D1Database;
} & {
	[key: string]: unknown;
};
