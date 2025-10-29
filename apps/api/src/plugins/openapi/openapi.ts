import { openapi as elysiaOpenAPI } from "@elysiajs/openapi";
import { preferredSecurityScheme, securitySchemes } from "./security-scheme";
import { tags } from "./tag";

export const openapi = elysiaOpenAPI({
	path: "docs",
	documentation: {
		info: {
			title: "mona-ca Backend API Documentation",
			version: "0.0.0",
		},
		tags,
		components: {
			securitySchemes,
		},
	},
	scalar: {
		authentication: {
			preferredSecurityScheme,
		},
	},
});
