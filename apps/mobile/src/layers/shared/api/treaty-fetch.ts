import { createTreatyFetch } from "@mona-ca/treaty-fetch";

export const treatyFetch = createTreatyFetch(process.env.EXPO_PUBLIC_APP_ENV === "production", {
	platform: "mobile",
	contentType: "application/json",
});

export const withBearer = (token: string) => {
	return `Bearer ${token}`;
};
