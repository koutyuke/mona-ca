import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { SignupConfirm } from "./confirm";
import { SignupRequest } from "./request";
import { SignupVerifyEmail } from "./verify-email";

export const Signup = new ElysiaWithEnv({
	prefix: "/signup",
})
	.use(SignupRequest)
	.use(SignupVerifyEmail)
	.use(SignupConfirm);
