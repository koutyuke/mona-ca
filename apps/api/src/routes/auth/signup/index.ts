import { Elysia } from "elysia";
import { SignupRegister } from "./register";
import { SignupRequest } from "./request";
import { SignupVerifyCode } from "./verify-code";

export const SignupRoutes = new Elysia({
	prefix: "/signup",
})
	.use(SignupRequest)
	.use(SignupVerifyCode)
	.use(SignupRegister);
