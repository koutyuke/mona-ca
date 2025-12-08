import { Elysia } from "elysia";
import { PasswordResetRequestRoute } from "./requests.route";
import { PasswordResetResetRoute } from "./reset.route";
import { PasswordResetVerifyRoute } from "./verify.route";

export const PasswordResetRoutes = new Elysia({
	prefix: "/password-reset",
})
	.use(PasswordResetRequestRoute)
	.use(PasswordResetVerifyRoute)
	.use(PasswordResetResetRoute);
