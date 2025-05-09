import { ElysiaWithEnv } from "../../modules/elysia-with-env";
import { AccountAssociation } from "./account-association";
import { AccountLink } from "./account-link";
import { EmailVerification } from "./email-verification";
import { ForgotPassword } from "./forgot-password";
import { Login } from "./login";
import { Logout } from "./logout";
import { OAuth } from "./oauth";
import { Signup } from "./signup";

export const Auth = new ElysiaWithEnv({
	prefix: "/auth",
})
	.use(EmailVerification)
	.use(ForgotPassword)
	.use(OAuth)
	.use(Login)
	.use(Logout)
	.use(Signup)
	.use(AccountLink)
	.use(AccountAssociation);
