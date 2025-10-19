import { t } from "elysia";
import { SignupRequestUseCase } from "../../../features/auth";
import { AuthUserRepository } from "../../../features/auth/adapters/repositories/auth-user/auth-user.repository";
import { SignupSessionRepository } from "../../../features/auth/adapters/repositories/signup-session/signup-session.repository";
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
import { EmailGateway } from "../../../shared/adapters/gateways/email";
import { verificationEmailTemplate } from "../../../shared/adapters/gateways/email/mail-context";
import { RandomGenerator, SessionSecretHasher } from "../../../shared/infra/crypto";
import { DrizzleService } from "../../../shared/infra/drizzle";
import { CookieManager } from "../../../shared/infra/elysia/cookie";
import { SIGNUP_SESSION_COOKIE_NAME } from "../../../shared/lib/http";

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
			const authUserRepository = new AuthUserRepository(drizzleService);
			const emailGateway = new EmailGateway(APP_ENV === "production", RESEND_API_KEY);

			const sessionSecretHasher = new SessionSecretHasher();
			const randomGenerator = new RandomGenerator();

			const signupRequestUseCase = new SignupRequestUseCase(
				signupSessionRepository,
				authUserRepository,
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

			await emailGateway.sendEmail({
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
