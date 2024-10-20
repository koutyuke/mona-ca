import type { OAuthProvider } from "../types/provider";

const checkProvider = (provider: string): provider is OAuthProvider => {
	return provider === "discord" || provider === "google";
};

export { checkProvider };
