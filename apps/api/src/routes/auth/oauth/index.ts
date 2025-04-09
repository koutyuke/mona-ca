import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { OAuthLoginCallback } from "./login-callback";
import { OAuthLoginRequest } from "./login-request";
import { OAuthSignupCallback } from "./signup-callback";
import { OAuthSignupRequest } from "./signup-request";

export const OAuth = new ElysiaWithEnv()
	.use(OAuthLoginRequest)
	.use(OAuthLoginCallback)
	.use(OAuthSignupRequest)
	.use(OAuthSignupCallback);
