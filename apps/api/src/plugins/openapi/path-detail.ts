import { CLIENT_PLATFORM_HEADER_NAME, SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import type { DocumentDecoration } from "elysia";
import type { Tag } from "./tag";

type PathDocumentProps = {
	operationId: string;
	summary: string;
	description?: string | string[];
	tag?: Tag;
	withAuth?: boolean;
	hide?: boolean;
};

export const pathDetail = (props: PathDocumentProps): DocumentDecoration => {
	let { operationId, summary, description = "", tag, withAuth = false, hide = false } = props;

	if (typeof description === "string") {
		description = [description];
	}

	if (withAuth) {
		description = [
			...description,
			"**Authentication**",
			"---",
			"Cookie Authentication",
			`  - If the \`${CLIENT_PLATFORM_HEADER_NAME}\` header is \`web\` or not provided, the session cookie to authenticate the request`,
			`  - Cookie Name: \`${SESSION_COOKIE_NAME}\``,
			"Bearer Authentication",
			`  - If the \`${CLIENT_PLATFORM_HEADER_NAME}\` header is \`mobile\`, the bearer token to authenticate the request`,
		];
	}

	description = description.join("\n\n");

	return {
		operationId,
		summary,
		description,
		tags: tag ? [tag] : [],
		hide,
		security: withAuth ? [{ BearerAuth: [] }, { CookieAuth: [] }] : [],
	};
};
