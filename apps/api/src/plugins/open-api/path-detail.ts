import type { DocumentDecoration } from "elysia";
import { CLIENT_TYPE_HEADER_NAME, SESSION_COOKIE_NAME } from "../../common/constants";
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
			"### **Authentication**",
			"---",
			"#### **Bearer Authentication**",
			`   If the \`${CLIENT_TYPE_HEADER_NAME}\` header is \`mobile\`, the bearer token to authenticate the request`,
			"#### **Cookie Authentication**",
			`   If the \`${CLIENT_TYPE_HEADER_NAME}\` header is \`web\`, the session cookie to authenticate the request`,
			`   _in: cookie, key: \`${SESSION_COOKIE_NAME}\`_`,
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
