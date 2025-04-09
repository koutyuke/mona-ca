import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { EmailVerificationConfirm } from "./confirm";
import { EmailVerificationRequest } from "./request";

const EmailVerification = new ElysiaWithEnv({
	prefix: "/email-verification",
})
	.use(EmailVerificationRequest)
	.use(EmailVerificationConfirm);

export { EmailVerification };
