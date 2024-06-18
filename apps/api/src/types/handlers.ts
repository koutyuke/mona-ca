export type FetchHandlerEnv = {
	DB: D1Database;
	APP_ENV: "development" | "production";
	PASSWORD_PEPPER: string;
};
