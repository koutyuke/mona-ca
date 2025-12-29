export const secureStorageKeys = {
	sessionToken: "SESSION_TOKEN",
	accountLinkToken: "ACCOUNT_LINK_TOKEN",
} as const satisfies Record<string, string>;

export const globalStorageKeys = {
	theme: "THEME",
	lastLoginMethod: "LAST_LOGIN_METHOD",
	user: "USER",
} as const satisfies Record<string, string>;

export const userStorageKeys = {
	// user
	userOfflineOutbox: "USER_OFFLINE_OUTBOX",
} as const satisfies Record<string, string>;
