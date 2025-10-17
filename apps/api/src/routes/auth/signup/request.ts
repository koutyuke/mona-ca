import { t } from "elysia";
import { SendEmailUseCase } from "../../../common/adapters/gateways/email";
import { verificationEmailTemplate } from "../../../common/adapters/gateways/email/mail-context";
import { CookieManager } from "../../../features/auth/adapters/http/cookie";
import { SignupSessionRepository } from "../../../features/auth/adapters/repositories/signup-session";
import { SignupRequestUseCase } from "../../../features/auth/application/use-cases/auth";
import { UserRepository } from "../../../features/user/adapters/repositories/user";
import { RandomGenerator, SessionSecretHasher } from "../../../infrastructure/crypto";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { SIGNUP_SESSION_COOKIE_NAME } from "../../../lib/constants";
import { CaptchaSchema, captcha } from "../../../plugins/captcha";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../plugins/elysia-with-env";
import { BadRequestException } from "../../../plugins/error";
import { pathDetail } from "../../../plugins/open-api";
import { RateLimiterSchema, rateLimit } from "../../../plugins/rate-limit";
import { WithClientTypeSchema, withClientType } from "../../../plugins/with-client-type";

export const SignupRequest = new ElysiaWithEnv()

	// Local Middleware & Plugin
	.use(withClientType)
	.use(
		rateLimit("signup-request", {
			maxTokens: 1000,
			refillRate: 500,
			refillInterval: {
				value: 10,
				unit: "m",
			},
		}),
	)
	.use(captcha)

	// Route
	.post(
		"",
		async ({ env: { APP_ENV, RESEND_API_KEY }, cfModuleEnv: { DB }, cookie, body: { email }, clientType }) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const signupSessionRepository = new SignupSessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const sessionSecretHasher = new SessionSecretHasher();
			const randomGenerator = new RandomGenerator();
			const sendEmailUseCase = new SendEmailUseCase(APP_ENV === "production", RESEND_API_KEY);

			const signupRequestUseCase = new SignupRequestUseCase(
				signupSessionRepository,
				userRepository,
				sessionSecretHasher,
				randomGenerator,
			);
			// === End of instances ===

			const result = await signupRequestUseCase.execute(email);

			if (result.isErr) {
				const { code } = result;

				if (code === "EMAIL_ALREADY_USED") {
					throw new BadRequestException({
						code: code,
						message: "Email is already used. Please use a different email address or try logging in.",
					});
				}

				throw new BadRequestException({
					code: code,
					message: "Signup request failed. Please try again.",
				});
			}

			const { signupSessionToken, signupSession } = result.value;

			const mailContents = verificationEmailTemplate(signupSession.email, signupSession.code);

			await sendEmailUseCase.sendEmail({
				from: mailContents.from,
				to: mailContents.to,
				subject: mailContents.subject,
				text: mailContents.text,
			});

			if (clientType === "mobile") {
				return {
					signupSessionToken,
				};
			}

			cookieManager.setCookie(SIGNUP_SESSION_COOKIE_NAME, signupSessionToken, {
				expires: signupSession.expiresAt,
			});

			return NoContentResponse();
		},
		{
			beforeHandle: async ({ rateLimit, ip, captcha, body: { email, cfTurnstileResponse } }) => {
				await captcha.verify(cfTurnstileResponse);
				await Promise.all([rateLimit.consume(ip, 1), rateLimit.consume(email, 100)]);
			},
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie({
				[SIGNUP_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				cfTurnstileResponse: t.String(),
				email: t.String(),
			}),
			response: withBaseResponseSchema({
				200: t.Object({
					signupSessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: ResponseTUnion(
					WithClientTypeSchema.response[400],
					CaptchaSchema.response[400],
					ErrorResponseSchema("EMAIL_ALREADY_USED"),
				),
				429: RateLimiterSchema.response[429],
			}),
			detail: pathDetail({
				tag: "Auth",
				operationId: "auth-signup-request",
				summary: "Signup Request",
				description: "Signup Request endpoint for the User",
			}),
		},
	);
