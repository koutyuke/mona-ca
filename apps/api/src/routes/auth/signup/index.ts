import { Elysia } from "elysia";
import { SignupRegisterRoute } from "./register.route";
import { SignupRequestRoute } from "./request.route";
import { SignupVerifyRoute } from "./verify.route";

export const SignupRoutes = new Elysia({
	prefix: "/signup",
})
	.use(SignupRequestRoute)
	.use(SignupVerifyRoute)
	.use(SignupRegisterRoute);
