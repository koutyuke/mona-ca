import { Elysia } from "elysia";
import { SignupConfirm } from "./confirm";
import { SignupRequest } from "./request";
import { SignupVerifyEmail } from "./verify-email";

export const Signup = new Elysia({
	prefix: "/signup",
})
	.use(SignupRequest)
	.use(SignupVerifyEmail)
	.use(SignupConfirm);
