import { Elysia } from "elysia";
import { AccountAssociation } from "./account-association";
import { AccountLink } from "./account-link";
import { EmailVerification } from "./email-verification";
import { ExternalAuth } from "./external-auth";
import { ForgotPassword } from "./forgot-password";
import { Login } from "./login";
import { Logout } from "./logout";
import { Signup } from "./signup";

export const Auth = new Elysia({
	prefix: "/auth",
})
	.use(EmailVerification)
	.use(ForgotPassword)
	.use(ExternalAuth)
	.use(Signup)
	.use(Login)
	.use(Logout)
	.use(AccountLink)
	.use(AccountAssociation);
