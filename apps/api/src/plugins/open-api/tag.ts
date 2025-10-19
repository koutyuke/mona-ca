import type { OpenAPIV3 } from "@scalar/types";

export const tags = [
	{ name: "Hello", description: "Hello, mona-ca!" },
	{ name: "Auth", description: "Endpoints for authentication and authorization" },
	{ name: "Auth - External Auth", description: "Endpoints for authentication and authorization with External Auth" },
	{ name: "Auth - Account Link", description: "Endpoints for account link" },
	{ name: "Auth - Account Association", description: "Endpoints for account association" },
	{ name: "Auth - Email Verification", description: "Endpoints for email verification" },
	{ name: "Auth - Forgot Password", description: "Endpoints for forgot password" },
	{ name: "Me", description: "Endpoints for the current user" },
	{ name: "User", description: "Endpoints for the other users" },
] as const satisfies OpenAPIV3.TagObject[];

export type Tag = (typeof tags)[number]["name"];
