import { Elysia, t } from "elysia";
import { env } from "../../../core/infra/config/env";
import {
	CookieManager,
	ErrorResponseSchema,
	ForbiddenException,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	UnauthorizedException,
	withBaseResponseSchema,
} from "../../../core/infra/elysia";
import { PASSWORD_RESET_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { newPasswordResetSessionToken } from "../../../features/auth";
import { di } from "../../../plugins/di";
import { pathDetail } from "../../../plugins/openapi";
import { WithClientTypeSchema, withClientType } from "../../../plugins/with-client-type";

export const ResetPassword = new Elysia()
	// Local Middleware & Plugin
	.use(di())
	.use(withClientType)

	// Route
	.post(
		"/reset",
		async ({
			cookie,
			body: { passwordResetSessionToken: bodyPasswordResetSessionToken, newPassword },
			clientType,
			containers,
		}) => {
			const cookieManager = new CookieManager(env.APP_ENV === "production", cookie);

			const rawPasswordResetSessionToken =
				clientType === "web"
					? cookieManager.getCookie(PASSWORD_RESET_SESSION_COOKIE_NAME)
					: bodyPasswordResetSessionToken;

			if (!rawPasswordResetSessionToken) {
				throw new UnauthorizedException({
					code: "PASSWORD_RESET_SESSION_INVALID",
					message: "Password reset session token not found. Please request password reset again.",
				});
			}

			const validationResult = await containers.auth.validatePasswordResetSessionUseCase.execute(
				newPasswordResetSessionToken(rawPasswordResetSessionToken),
			);

			if (validationResult.isErr) {
				const { code } = validationResult;

				if (code === "PASSWORD_RESET_SESSION_INVALID") {
					throw new UnauthorizedException({
						code: code,
						message: "Invalid password reset session. Please request password reset again.",
					});
				}
				if (code === "PASSWORD_RESET_SESSION_EXPIRED") {
					throw new UnauthorizedException({
						code: code,
						message: "Password reset session has expired. Please request password reset again.",
					});
				}
			}

			const { passwordResetSession, userIdentity } = validationResult.value;

			const resetResult = await containers.auth.resetPasswordUseCase.execute(
				newPassword,
				passwordResetSession,
				userIdentity,
			);

			if (resetResult.isErr) {
				const { code } = resetResult;

				if (code === "REQUIRED_EMAIL_VERIFICATION") {
					throw new ForbiddenException({
						code: code,
						message: "Email verification is required before resetting password. Please verify your email first.",
					});
				}
			}

			if (clientType === "web") {
				cookieManager.deleteCookie(PASSWORD_RESET_SESSION_COOKIE_NAME);
			}

			return NoContentResponse();
			// This endpoint is not return. If return 200, redirect to login page.
		},
		{
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[PASSWORD_RESET_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				newPassword: t.String(),
				passwordResetSessionToken: t.Optional(t.String()),
			}),
			response: withBaseResponseSchema({
				204: NoContentResponseSchema,
				400: WithClientTypeSchema.response[400],
				401: ResponseTUnion(
					ErrorResponseSchema("PASSWORD_RESET_SESSION_INVALID"),
					ErrorResponseSchema("PASSWORD_RESET_SESSION_EXPIRED"),
				),
				403: ErrorResponseSchema("REQUIRED_EMAIL_VERIFICATION"),
			}),
			detail: pathDetail({
				tag: "Auth - Forgot Password",
				operationId: "auth-forgot-password-reset",
				summary: "Reset Password",
				description: "Reset Password endpoint for the User",
			}),
		},
	);
