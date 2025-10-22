import { Elysia, t } from "elysia";
import { env } from "../../../core/infra/config/env";
import {
	BadRequestException,
	CookieManager,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	UnauthorizedException,
	withBaseResponseSchema,
} from "../../../core/infra/elysia";
import { EMAIL_VERIFICATION_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { newEmailVerificationSessionToken } from "../../../features/auth";
import { AuthGuardSchema, authGuard } from "../../../plugins/auth-guard";
import { di } from "../../../plugins/di";
import { pathDetail } from "../../../plugins/open-api";
import { RateLimiterSchema, rateLimit } from "../../../plugins/rate-limit";

const EmailVerificationConfirm = new Elysia()
	// Local Middleware & Plugin
	.use(di())
	.use(authGuard({ requireEmailVerification: false }))
	.use(
		rateLimit("email-verification-confirm", {
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
		"/confirm",
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
				throw new UnauthorizedException({
					code: "EMAIL_VERIFICATION_SESSION_INVALID",
					message: "Email verification session token not found. Please request email verification again.",
				});
			}

			const validationResult = await containers.auth.validateEmailVerificationSessionUseCase.execute(
				userIdentity,
				newEmailVerificationSessionToken(rawEmailVerificationSessionToken),
			);

			if (validationResult.isErr) {
				const { code } = validationResult;

				if (code === "EMAIL_VERIFICATION_SESSION_INVALID") {
					throw new UnauthorizedException({
						code: code,
						message: "Invalid email verification session. Please request email verification again.",
					});
				}
				if (code === "EMAIL_VERIFICATION_SESSION_EXPIRED") {
					throw new UnauthorizedException({
						code: code,
						message: "Email verification session has expired. Please request email verification again.",
					});
				}
			}

			const { emailVerificationSession } = validationResult.value;

			await rateLimit.consume(emailVerificationSession.id, 100);

			const confirmResult = await containers.auth.emailVerificationConfirmUseCase.execute(
				code,
				userIdentity,
				emailVerificationSession,
			);

			if (confirmResult.isErr) {
				const { code } = confirmResult;

				if (code === "INVALID_VERIFICATION_CODE") {
					throw new BadRequestException({
						code: code,
						message: "Invalid verification code. Please check your email and try again.",
					});
				}
				if (code === "EMAIL_MISMATCH") {
					throw new BadRequestException({
						code: code,
						message: "Email mismatch. Please use the email address you requested verification for.",
					});
				}
			}

			return NoContentResponse();
		},
		{
			beforeHandle: async ({ rateLimit, userIdentity }) => {
				await rateLimit.consume(userIdentity.id, 1);
			},
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
				204: NoContentResponseSchema,
				400: ResponseTUnion(
					AuthGuardSchema.response[400],
					ErrorResponseSchema("INVALID_VERIFICATION_CODE"),
					ErrorResponseSchema("EMAIL_MISMATCH"),
				),
				401: ResponseTUnion(
					AuthGuardSchema.response[401],
					ErrorResponseSchema("EMAIL_VERIFICATION_SESSION_INVALID"),
					ErrorResponseSchema("EMAIL_VERIFICATION_SESSION_EXPIRED"),
				),
				429: RateLimiterSchema.response[429],
			}),
			detail: pathDetail({
				operationId: "auth-email-verification-confirm",
				summary: "Email Verification Confirm",
				description: "The User can confirm email verification by this endpoint",
				tag: "Auth - Email Verification",
				withAuth: true,
			}),
		},
	);

export { EmailVerificationConfirm };
