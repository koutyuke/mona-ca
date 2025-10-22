import { Elysia } from "elysia";
import { EmailVerificationConfirm } from "./confirm";
import { EmailVerificationRequest } from "./request";

const EmailVerification = new Elysia({
	prefix: "/email-verification",
})
	.use(EmailVerificationRequest)
	.use(EmailVerificationConfirm);

export { EmailVerification };
