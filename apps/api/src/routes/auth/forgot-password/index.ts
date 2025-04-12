import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { PasswordResetRequest } from "./requests";
import { ResetPassword } from "./reset";
import { PasswordResetVerifyEmail } from "./verify-email";

const ForgotPassword = new ElysiaWithEnv({
	prefix: "/forgot-password",
})
	.use(PasswordResetRequest)
	.use(PasswordResetVerifyEmail)
	.use(ResetPassword);

export { ForgotPassword };
