import { Elysia, t } from "elysia";
import { env } from "../../../core/infra/config/env";
import {
	BadRequestException,
	CookieManager,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../core/infra/elysia";
import { EMAIL_VERIFICATION_SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { AuthGuardSchema, authGuard } from "../../../plugins/auth-guard";
import { di } from "../../../plugins/di";
import { pathDetail } from "../../../plugins/openapi";
import { RateLimiterSchema, rateLimit } from "../../../plugins/rate-limit";

export const EmailVerificationRequest = new Elysia()
	// Local Middleware & Plugin
	.use(di())
	.use(authGuard({ requireEmailVerification: false }))
	.use(
		rateLimit("email-verification-request", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)

	// Route
	.post(
		"",
		async ({ cookie, body: { email: bodyEmail }, userIdentity, clientType, rateLimit, containers }) => {
			const cookieManager = new CookieManager(env.APP_ENV === "production", cookie);

			const email = bodyEmail ?? userIdentity.email;

			await rateLimit.consume(email, 100);

			const result = await containers.auth.emailVerificationRequestUseCase.execute(email, userIdentity);

			if (result.isErr) {
				const { code } = result;

				if (code === "EMAIL_ALREADY_VERIFIED") {
					throw new BadRequestException({
						code: code,
						message: "Email is already verified. Please use a different email address.",
					});
				}
				if (code === "EMAIL_ALREADY_REGISTERED") {
					throw new BadRequestException({
						code: code,
						message: "Email is already registered by another user. Please use a different email address.",
					});
				}
			}

			const { emailVerificationSession, emailVerificationSessionToken } = result.value;

			if (clientType === "mobile") {
				return {
					emailVerificationSessionToken,
				};
			}

			cookieManager.setCookie(EMAIL_VERIFICATION_SESSION_COOKIE_NAME, emailVerificationSessionToken, {
				expires: emailVerificationSession.expiresAt,
			});

			return NoContentResponse();
		},
		{
			beforeHandle: async ({ rateLimit, userIdentity }) => {
				await rateLimit.consume(userIdentity.id, 1);
			},
			headers: AuthGuardSchema.headers,
			cookie: t.Cookie({
				[EMAIL_VERIFICATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				email: t.Nullable(
					t.String({
						format: "email",
					}),
				),
			}),
			response: withBaseResponseSchema({
				200: t.Object({
					emailVerificationSessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: ResponseTUnion(
					AuthGuardSchema.response[400],
					ErrorResponseSchema("EMAIL_ALREADY_VERIFIED"),
					ErrorResponseSchema("EMAIL_ALREADY_REGISTERED"),
				),
				401: AuthGuardSchema.response[401],
				429: RateLimiterSchema.response[429],
			}),
			detail: pathDetail({
				operationId: "auth-email-verification-request",
				summary: "Email Verification Request",
				description: "The User can request email verification by this endpoint",
				tag: "Auth - Email Verification",
				withAuth: true,
			}),
		},
	);
