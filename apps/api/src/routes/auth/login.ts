import { t } from "elysia";
import { PasswordService } from "../../application/services/password";
import { SessionTokenService } from "../../application/services/session-token";
import { LoginUseCase } from "../../application/use-cases/auth";
import { SESSION_COOKIE_NAME } from "../../common/constants";
import { FlattenUnion } from "../../common/schema";
import { isErr } from "../../common/utils";
import { DrizzleService } from "../../infrastructure/drizzle";
import { SessionRepository } from "../../interface-adapter/repositories/session";
import { UserRepository } from "../../interface-adapter/repositories/user";
import { CaptchaSchema, captcha } from "../../modules/captcha";
import { CookieService } from "../../modules/cookie";
import { ElysiaWithEnv, NoContentResponse, NoContentResponseSchema } from "../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../modules/error";
import { pathDetail } from "../../modules/open-api";
import { RateLimiterSchema, rateLimiter } from "../../modules/rate-limiter";
import { WithClientTypeSchema, withClientType } from "../../modules/with-client-type";

const cookieSchemaObject = {
	[SESSION_COOKIE_NAME]: t.Optional(t.String()),
};

export const Login = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)
	.use(
		rateLimiter("login", {
			maxTokens: 100,
			refillRate: 50,
			refillInterval: {
				value: 30,
				unit: "m",
			},
		}),
	)
	.use(captcha)

	// Route
	.post(
		"/login",
		async ({
			clientType,
			env: { SESSION_PEPPER, APP_ENV, PASSWORD_PEPPER },
			cfModuleEnv: { DB },
			cookie,
			body: { email, password },
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieService = new CookieService(APP_ENV === "production", cookie, cookieSchemaObject);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);
			const passwordService = new PasswordService(PASSWORD_PEPPER);

			const sessionRepository = new SessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const loginUseCase = new LoginUseCase(sessionRepository, userRepository, passwordService, sessionTokenService);
			// === End of instances ===

			const result = await loginUseCase.execute(email, password);

			if (isErr(result)) {
				const { code } = result;

				throw new BadRequestException({
					name: code,
					message: "Invalid email or password",
				});
			}
			const { session, sessionToken } = result;

			if (clientType === "mobile") {
				return {
					sessionToken,
				};
			}

			cookieService.setCookie(SESSION_COOKIE_NAME, sessionToken, {
				expires: session.expiresAt,
			});

			return NoContentResponse();
		},
		{
			beforeHandle: async ({ rateLimiter, ip, captcha, body: { email, cfTurnstileResponse } }) => {
				await Promise.all([
					rateLimiter.consume(ip, 1),
					rateLimiter.consume(email, 10),
					captcha.verify(cfTurnstileResponse),
				]);
			},
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie(cookieSchemaObject),
			body: t.Object({
				cfTurnstileResponse: t.String(),
				email: t.String({
					format: "email",
				}),
				password: t.String(),
			}),
			response: {
				200: t.Object({
					sessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: FlattenUnion(
					WithClientTypeSchema.response[400],
					CaptchaSchema.response[400],
					ErrorResponseSchema("INVALID_EMAIL_OR_PASSWORD"),
				),
				429: RateLimiterSchema.response[429],
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				operationId: "auth-login",
				summary: "Login",
				description: "Login to the application",
				tag: "Auth",
			}),
		},
	);
