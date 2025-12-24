import { Elysia } from "elysia";
import { AccountLinkRoutes } from "./account-link";
import { EmailVerificationRoutes } from "./email-verification";
import { FederatedAuthRoutes } from "./federated-auth";
import { LoginRoute } from "./login.route";
import { LogoutRoute } from "./logout.route";
import { PasswordResetRoutes } from "./password-reset";
import { SignupRoutes } from "./signup";

export const AuthRoutes = new Elysia({
	prefix: "/auth",
})
	.use(LoginRoute)
	.use(LogoutRoute)
	.use(SignupRoutes)
	.use(EmailVerificationRoutes)
	.use(FederatedAuthRoutes)
	.use(PasswordResetRoutes)
	.use(AccountLinkRoutes);
