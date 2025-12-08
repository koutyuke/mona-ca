import { Elysia } from "elysia";
import { EmailVerificationRequestRoute } from "./request.route";
import { EmailVerificationVerifyRoute } from "./verify.route";

export const EmailVerificationRoutes = new Elysia({
	prefix: "/email-verification",
})
	.use(EmailVerificationRequestRoute)
	.use(EmailVerificationVerifyRoute);
