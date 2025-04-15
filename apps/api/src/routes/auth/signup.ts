import { t } from "elysia";
import { PasswordService } from "../../application/services/password";
import { SessionTokenService } from "../../application/services/session-token";
import { SignupUseCase } from "../../application/use-cases/auth";
import { SESSION_COOKIE_NAME } from "../../common/constants";
import { FlattenUnion } from "../../common/schema";
import { isErr } from "../../common/utils";
import { genderSchema, newGender } from "../../domain/value-object";
import { DrizzleService } from "../../infrastructure/drizzle";
import { SessionRepository } from "../../interface-adapter/repositories/session";
import { UserRepository } from "../../interface-adapter/repositories/user";
import { CaptchaSchema, captcha } from "../../modules/captcha";
import { CookieManager } from "../../modules/cookie";
import { ElysiaWithEnv, NoContentResponse, NoContentResponseSchema } from "../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../modules/error";
import { pathDetail } from "../../modules/open-api";
import { RateLimiterSchema, rateLimiter } from "../../modules/rate-limiter";
import { WithClientTypeSchema, withClientType } from "../../modules/with-client-type";

export const Signup = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)
	.use(
		rateLimiter("signup", {
			maxTokens: 100,
			refillRate: 10,
			refillInterval: {
				value: 1,
				unit: "m",
			},
		}),
	)
	.use(captcha)

	// Route
	.post(
		"/signup",
		async ({
			clientType,
			env: { APP_ENV, PASSWORD_PEPPER, SESSION_PEPPER },
			cfModuleEnv: { DB },
			cookie,
			body: { name, email, password, gender },
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);
			const passwordService = new PasswordService(PASSWORD_PEPPER);

			const sessionRepository = new SessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const signupUseCase = new SignupUseCase(sessionRepository, userRepository, passwordService, sessionTokenService);
			// === End of instances ===

			const result = await signupUseCase.execute(name, email, password, newGender(gender));

			if (isErr(result)) {
				const { code } = result;

				throw new BadRequestException({
					name: code,
				});
			}

			const { session, sessionToken } = result;

			if (clientType === "mobile") {
				return {
					sessionToken,
				};
			}

			cookieManager.setCookie(SESSION_COOKIE_NAME, sessionToken, {
				expires: session.expiresAt,
			});

			return NoContentResponse();
		},
		{
			beforeHandle: async ({ rateLimiter, ip, captcha, body: { cfTurnstileResponse } }) => {
				await Promise.all([rateLimiter.consume(ip, 1), captcha.verify(cfTurnstileResponse)]);
			},
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				cfTurnstileResponse: t.String(),
				email: t.String({
					format: "email",
				}),
				password: t.String({
					minLength: 8,
					maxLength: 64,
				}),
				name: t.String({
					minLength: 3,
					maxLength: 32,
				}),
				gender: genderSchema,
			}),
			response: {
				200: t.Object({
					sessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: FlattenUnion(
					WithClientTypeSchema.response[400],
					CaptchaSchema.response[400],
					ErrorResponseSchema("EMAIL_ALREADY_USED"),
				),
				429: RateLimiterSchema.response[429],
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				operationId: "auth-signup",
				summary: "Signup",
				description: "Signup to the application",
				tag: "Auth",
			}),
		},
	);
