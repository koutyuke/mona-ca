import type { DocumentDecoration } from "elysia";
import { SESSION_COOKIE_NAME } from "../../core/lib/http";
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
			"#### **Cookie Authentication**",
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
