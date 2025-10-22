import { Elysia } from "elysia";
import { ExternalAuthLoginCallback } from "./login-callback";
import { ExternalAuthLoginRequest } from "./login-request";
import { ExternalAuthSignupCallback } from "./signup-callback";
import { ExternalAuthSignupRequest } from "./signup-request";

export const ExternalAuth = new Elysia()
	.use(ExternalAuthLoginRequest)
	.use(ExternalAuthLoginCallback)
	.use(ExternalAuthSignupRequest)
	.use(ExternalAuthSignupCallback);
