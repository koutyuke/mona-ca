import { Elysia, t } from "elysia";
import { env } from "../../core/infra/config/env";
import {
	BadRequestException,
	CookieManager,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../core/infra/elysia";
import { EMAIL_VERIFICATION_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../core/lib/http";
import { newEmailVerificationSessionToken } from "../../features/auth/domain/value-objects/session-token";
import { AuthGuardSchema, authGuard } from "../../plugins/auth-guard";
import { di } from "../../plugins/di";
import { pathDetail } from "../../plugins/open-api";
import { rateLimit } from "../../plugins/rate-limit";

export const UpdateEmail = new Elysia()
	// Local Middleware & Plugin
	.use(di())
	.use(authGuard({ requireEmailVerification: false }))
	.use(
		rateLimit("me-update-email", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)

	// Route
	.patch(
		"/email",
		async ({
			cookie,
			body: { code, emailVerificationSessionToken: bodyEmailVerificationSessionToken },
			userIdentity,
			clientType,
			rateLimit,
			containers,
		}) => {
			const cookieManager = new CookieManager(env.APP_ENV === "production", cookie);

			const rawEmailVerificationSessionToken =
				clientType === "web"
					? cookieManager.getCookie(EMAIL_VERIFICATION_SESSION_COOKIE_NAME)
					: bodyEmailVerificationSessionToken;

			if (!rawEmailVerificationSessionToken) {
				throw new BadRequestException({
					code: "EMAIL_VERIFICATION_SESSION_INVALID",
					message: "Email verification session is invalid. Please request a new verification email.",
				});
			}

			const validationResult = await containers.auth.validateEmailVerificationSessionUseCase.execute(
				userIdentity,
				newEmailVerificationSessionToken(rawEmailVerificationSessionToken),
			);

			if (validationResult.isErr) {
				const { code } = validationResult;

				if (code === "EMAIL_VERIFICATION_SESSION_EXPIRED") {
					throw new BadRequestException({
						code: "EMAIL_VERIFICATION_SESSION_EXPIRED",
						message: "Email verification session has expired. Please request a new verification email.",
					});
				}
				if (code === "EMAIL_VERIFICATION_SESSION_INVALID") {
					throw new BadRequestException({
						code: "EMAIL_VERIFICATION_SESSION_INVALID",
						message: "Invalid email verification session. Please request a new verification email.",
					});
				}
			}

			const { emailVerificationSession } = validationResult.value;

			await rateLimit.consume(emailVerificationSession.id, 100);

			const updateResult = await containers.auth.updateEmailUseCase.execute(
				code,
				userIdentity,
				emailVerificationSession,
			);

			if (updateResult.isErr) {
				const { code } = updateResult;

				if (code === "EMAIL_ALREADY_REGISTERED") {
					throw new BadRequestException({
						code: "EMAIL_ALREADY_REGISTERED",
						message: "Email is already in use by another account. Please use a different email address.",
					});
				}
				if (code === "INVALID_VERIFICATION_CODE") {
					throw new BadRequestException({
						code: "INVALID_VERIFICATION_CODE",
						message: "Invalid verification code. Please check the code and try again.",
					});
				}
			}

			const { session, sessionToken } = updateResult.value;

			if (clientType === "mobile") {
				return {
					sessionToken,
				};
			}

			cookieManager.deleteCookie(EMAIL_VERIFICATION_SESSION_COOKIE_NAME);

			cookieManager.setCookie(SESSION_COOKIE_NAME, sessionToken, {
				expires: session.expiresAt,
			});

			return NoContentResponse();
		},
		{
			headers: AuthGuardSchema.headers,
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[EMAIL_VERIFICATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				code: t.String(),
				emailVerificationSessionToken: t.Optional(t.String()),
			}),
			response: withBaseResponseSchema({
				200: t.Object({
					sessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: ResponseTUnion(
					AuthGuardSchema.response[400],
					ErrorResponseSchema("EMAIL_ALREADY_REGISTERED"),
					ErrorResponseSchema("EMAIL_VERIFICATION_SESSION_EXPIRED"),
					ErrorResponseSchema("EMAIL_VERIFICATION_SESSION_INVALID"),
					ErrorResponseSchema("INVALID_VERIFICATION_CODE"),
				),
				401: AuthGuardSchema.response[401],
			}),
			detail: pathDetail({
				operationId: "me-update-email",
				summary: "Update Email",
				description: "Update Email endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
