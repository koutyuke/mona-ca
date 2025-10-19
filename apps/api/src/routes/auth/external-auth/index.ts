import { ElysiaWithEnv } from "../../../plugins/elysia-with-env";
import { ExternalAuthLoginCallback } from "./login-callback";
import { ExternalAuthLoginRequest } from "./login-request";
import { ExternalAuthSignupCallback } from "./signup-callback";
import { ExternalAuthSignupRequest } from "./signup-request";

export const OAuth = new ElysiaWithEnv()
	.use(ExternalAuthLoginRequest)
	.use(ExternalAuthLoginCallback)
	.use(ExternalAuthSignupRequest)
	.use(ExternalAuthSignupCallback);
