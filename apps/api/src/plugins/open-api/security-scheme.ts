import type { OpenAPIV3 } from "openapi-types";
import { SESSION_COOKIE_NAME } from "../../lib/constants";

export const securitySchemes = {
	BearerAuth: {
		type: "http",
		scheme: "bearer",
		bearerFormat: "String",
	},
	CookieAuth: {
		type: "apiKey",
		in: "cookie",
		name: SESSION_COOKIE_NAME,
		description: "Session Cookie",
	},
} as const satisfies Record<string, OpenAPIV3.SecuritySchemeObject>;

export const preferredSecurityScheme = Object.keys(securitySchemes) as (keyof typeof securitySchemes)[];
