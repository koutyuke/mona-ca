import { Elysia } from "elysia";
import { AccountAssociationRoutes } from "./account-association";
import { AccountLinkRoutes } from "./account-link";
import { EmailVerificationRoutes } from "./email-verification";
import { ExternalAuthRoutes } from "./external-auth";
import { ForgotPasswordRoutes } from "./forgot-password";
import { Login } from "./login";
import { Logout } from "./logout";
import { SignupRoutes } from "./signup";

export const AuthRoutes = new Elysia({
	prefix: "/auth",
})
	.use(Login)
	.use(Logout)
	.use(EmailVerificationRoutes)
	.use(ForgotPasswordRoutes)
	.use(ExternalAuthRoutes)
	.use(SignupRoutes)
	.use(AccountLinkRoutes)
	.use(AccountAssociationRoutes);
