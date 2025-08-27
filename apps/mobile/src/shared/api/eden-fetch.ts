import { createEdenFetch } from "@mona-ca/eden-fetch";

export const edenFetch = createEdenFetch(process.env.EXPO_PUBLIC_APP_ENV === "production", {
	headers: {
		"content-type": "application/json",
	},
});

export const withBearer = (token: string) => {
	return `Bearer ${token}`;
};
