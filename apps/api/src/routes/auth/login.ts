import { t } from "elysia";
import { LoginUseCase } from "../../features/auth";
import { AuthUserRepository } from "../../features/auth/adapters/repositories/auth-user/auth-user.repository";
import { SessionRepository } from "../../features/auth/adapters/repositories/session/session.repository";
import { CaptchaSchema, captcha } from "../../plugins/captcha";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../plugins/elysia-with-env";
import { BadRequestException } from "../../plugins/error";
import { pathDetail } from "../../plugins/open-api";
import { RateLimiterSchema, rateLimit } from "../../plugins/rate-limit";
import { WithClientTypeSchema, withClientType } from "../../plugins/with-client-type";
import { PasswordHasher, SessionSecretHasher } from "../../shared/infra/crypto";
import { DrizzleService } from "../../shared/infra/drizzle";
import { CookieManager } from "../../shared/infra/elysia/cookie";
import { SESSION_COOKIE_NAME } from "../../shared/lib/http";

export const Login = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)
	.use(
		rateLimit("login", {
			maxTokens: 1000,
			refillRate: 500,
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
			env: { APP_ENV, PASSWORD_PEPPER },
			cfModuleEnv: { DB },
			cookie,
			body: { email, password },
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const sessionRepository = new SessionRepository(drizzleService);
			const authUserRepository = new AuthUserRepository(drizzleService);

			const sessionSecretHasher = new SessionSecretHasher();
			const passwordHasher = new PasswordHasher(PASSWORD_PEPPER);

			const loginUseCase = new LoginUseCase(sessionRepository, authUserRepository, sessionSecretHasher, passwordHasher);
			// === End of instances ===

			const result = await loginUseCase.execute(email, password);

			if (result.isErr) {
				const { code } = result;

				if (code === "INVALID_CREDENTIALS") {
					throw new BadRequestException({
						code: "INVALID_CREDENTIALS",
						message: "Invalid email or password. Please check your credentials and try again.",
					});
				}
				throw new BadRequestException({
					code: code,
					message: "Login failed. Please try again.",
				});
			}
			const { session, sessionToken } = result.value;

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
			beforeHandle: async ({ rateLimit, ip, captcha, body: { email, cfTurnstileResponse } }) => {
				await captcha.verify(cfTurnstileResponse);
				await Promise.all([rateLimit.consume(ip, 1), rateLimit.consume(email, 100)]);
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
				password: t.String(),
			}),
			response: withBaseResponseSchema({
				200: t.Object({
					sessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: ResponseTUnion(
					WithClientTypeSchema.response[400],
					CaptchaSchema.response[400],
					ErrorResponseSchema("INVALID_CREDENTIALS"),
				),
				429: RateLimiterSchema.response[429],
			}),
			detail: pathDetail({
				operationId: "auth-login",
				summary: "Login",
				description: "Login to the application",
				tag: "Auth",
			}),
		},
	);
