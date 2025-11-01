import { Elysia } from "elysia";
import { EmailVerificationConfirm } from "./confirm";
import { EmailVerificationRequest } from "./request";

export const EmailVerificationRoutes = new Elysia({
	prefix: "/email-verification",
})
	.use(EmailVerificationRequest)
	.use(EmailVerificationConfirm);
