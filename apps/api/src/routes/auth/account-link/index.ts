import Elysia from "elysia";
import { AccountLinkPreviewRoute } from "./preview.route";
import { AccountLinkResendRoute } from "./resend.route";
import { AccountLinkVerifyRoute } from "./verify.route";

export const AccountLinkRoutes = new Elysia({
	prefix: "/account-link",
})
	.use(AccountLinkResendRoute)
	.use(AccountLinkVerifyRoute)
	.use(AccountLinkPreviewRoute);
