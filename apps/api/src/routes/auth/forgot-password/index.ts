import { Elysia } from "elysia";
import { PasswordResetRequest } from "./requests";
import { ResetPassword } from "./reset";
import { PasswordResetVerifyEmail } from "./verify-email";

const ForgotPassword = new Elysia({
	prefix: "/forgot-password",
})
	.use(PasswordResetRequest)
	.use(PasswordResetVerifyEmail)
	.use(ResetPassword);

export { ForgotPassword };
