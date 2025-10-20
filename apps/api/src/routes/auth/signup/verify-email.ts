import { t } from "elysia";
import { SignupVerifyEmailUseCase, ValidateSignupSessionUseCase } from "../../../features/auth";
import { SignupSessionRepository } from "../../../features/auth/adapters/repositories/signup-session/signup-session.repository";
import { newSignupSessionToken } from "../../../features/auth/domain/value-objects/session-token";
import { CookieManager } from "../../../plugins/cookie";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../plugins/elysia-with-env";
import { BadRequestException, UnauthorizedException } from "../../../plugins/error";
import { pathDetail } from "../../../plugins/open-api";
import { RateLimiterSchema, rateLimit } from "../../../plugins/rate-limit";
import { WithClientTypeSchema, withClientType } from "../../../plugins/with-client-type";
import { SessionSecretHasher } from "../../../shared/infra/crypto";
import { DrizzleService } from "../../../shared/infra/drizzle";
import { SIGNUP_SESSION_COOKIE_NAME } from "../../../shared/lib/http";

export const SignupVerifyEmail = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)
	.use(
		rateLimit("signup-verify-email", {
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
		"/verify-email",
		async ({
			env: { APP_ENV },
			cfModuleEnv: { DB },
			cookie,
			body: { signupSessionToken: bodySignupSessionToken, code },
			clientType,
			rateLimit,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const signupSessionRepository = new SignupSessionRepository(drizzleService);

			const sessionSecretHasher = new SessionSecretHasher();

			const validateSignupSessionUseCase = new ValidateSignupSessionUseCase(
				signupSessionRepository,
				sessionSecretHasher,
			);
			const signupVerifyEmailUseCase = new SignupVerifyEmailUseCase(signupSessionRepository);
			// === End of instances ===

			const rawSignupSessionToken =
				clientType === "web" ? cookieManager.getCookie(SIGNUP_SESSION_COOKIE_NAME) : bodySignupSessionToken;

			if (!rawSignupSessionToken) {
				throw new UnauthorizedException({
					code: "SIGNUP_SESSION_INVALID",
					message: "Signup session token not found. Please request signup again.",
				});
			}

			const validationResult = await validateSignupSessionUseCase.execute(newSignupSessionToken(rawSignupSessionToken));

			if (validationResult.isErr) {
				const { code } = validationResult;

				if (code === "SIGNUP_SESSION_INVALID") {
					throw new UnauthorizedException({
						code: code,
						message: "Signup session token is invalid. Please request signup again.",
					});
				}
				if (code === "SIGNUP_SESSION_EXPIRED") {
					throw new UnauthorizedException({
						code: code,
						message: "Signup session token has expired. Please request signup again.",
					});
				}
			}

			const { signupSession } = validationResult.value;

			await rateLimit.consume(signupSession.id, 100);

			const verifyEmailResult = await signupVerifyEmailUseCase.execute(code, signupSession);

			if (verifyEmailResult.isErr) {
				const { code } = verifyEmailResult;

				if (code === "INVALID_VERIFICATION_CODE") {
					throw new BadRequestException({
						code: code,
						message: "Invalid verification code. Please check your email and try again.",
					});
				}
				if (code === "ALREADY_VERIFIED") {
					throw new BadRequestException({
						code: code,
						message: "Email is already verified. Please login.",
					});
				}
			}

			return NoContentResponse();
		},
		{
			beforeHandle: async ({ rateLimit, ip }) => {
				await rateLimit.consume(ip, 1);
			},
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie({
				[SIGNUP_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				signupSessionToken: t.Optional(t.String()),
				code: t.String(),
			}),
			response: withBaseResponseSchema({
				204: NoContentResponseSchema,
				400: ResponseTUnion(
					WithClientTypeSchema.response[400],
					ErrorResponseSchema("INVALID_VERIFICATION_CODE"),
					ErrorResponseSchema("ALREADY_VERIFIED"),
				),
				401: ResponseTUnion(
					ErrorResponseSchema("SIGNUP_SESSION_INVALID"),
					ErrorResponseSchema("SIGNUP_SESSION_EXPIRED"),
				),
				429: RateLimiterSchema.response[429],
			}),
			detail: pathDetail({
				operationId: "auth-signup-verify-email",
				summary: "Signup Verify Email",
				description: "Signup Verify Email endpoint for the User",
				tag: "Auth",
			}),
		},
	);
