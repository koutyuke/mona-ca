import type { DocumentDecoration } from "elysia";
import { SESSION_COOKIE_NAME } from "../../common/constants";
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

	if (Array.isArray(description)) {
		description = description.join("\n\n");
	}

	if (withAuth) {
		description = description ? `${description}\n\n` : "";
		description =
			description +
			[
				"##### **Authentication**",
				"---",
				"1. **Bearer Authentication**",
				"   The bearer token to authenticate the request",
				"---",
				"2. **Cookie Authentication**",
				"   The session cookie to authenticate the request",
				`   _in: cookie, key: \`${SESSION_COOKIE_NAME}\`_`,
			].join("\n\n");
	}

	return {
		operationId,
		summary,
		description,
		tags: tag ? [tag] : [],
		hide,
		security: withAuth ? [{ BearerAuth: [] }, { CookieAuth: [] }] : [],
	};
};
