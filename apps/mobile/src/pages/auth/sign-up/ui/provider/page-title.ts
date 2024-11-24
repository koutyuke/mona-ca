import { type OAuthProvider, capitalizeProvider } from "../../../../../features/auth";

const pageTitle = (provider: OAuthProvider) => ["Sign up", `with ${capitalizeProvider(provider)}`];

pageTitle.length = 2;

export { pageTitle };
