import { type OAuthProvider, capitalizeProvider } from "@mobile/features/auth";

const pageTitle = (provider: OAuthProvider) => ["Sign up", `with ${capitalizeProvider(provider)}`];

pageTitle.length = 2;

export { pageTitle };
