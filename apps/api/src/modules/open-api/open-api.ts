import swagger from "@elysiajs/swagger";
import { preferredSecurityScheme, securitySchemes } from "./security-scheme";
import { tags } from "./tag";

export const openAPI = swagger({
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
	scalarConfig: {
		authentication: {
			preferredSecurityScheme,
		},
	},
});
