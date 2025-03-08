import { t } from "elysia";
import { PasswordService } from "../../../../application/services/password";
import { SessionTokenService } from "../../../../application/services/session-token";
import { LoginUseCase } from "../../../../application/use-cases/auth";
import { SESSION_COOKIE_NAME } from "../../../../common/constants";
import { clientSchema } from "../../../../common/schema";
import { isErr } from "../../../../common/utils";
import { DrizzleService } from "../../../../infrastructure/drizzle";
import { SessionRepository } from "../../../../interface-adapter/repositories/session";
import { UserRepository } from "../../../../interface-adapter/repositories/user";
import { captcha } from "../../../../modules/captcha";
import { CookieService } from "../../../../modules/cookie";
import { ElysiaWithEnv } from "../../../../modules/elysia-with-env";
import { BadRequestException, InternalServerErrorException } from "../../../../modules/error";
import { rateLimiter } from "../../../../modules/rate-limiter";
import { Provider } from "./[provider]";

const cookieSchemaObject = {
	[SESSION_COOKIE_NAME]: t.Optional(t.String()),
};

export const Login = new ElysiaWithEnv({
	prefix: "/login",
})
	// Other Route
	.use(Provider)

	// Local Middleware & Plugin
	.use(
		rateLimiter("login", {
			refillRate: 50,
			maxTokens: 100,
			interval: {
				value: 10,
				unit: "m",
			},
		}),
	)
	.use(captcha)

	// Route
	.post(
		"/",
		async ({
			env: { SESSION_PEPPER, APP_ENV, PASSWORD_PEPPER },
			cfModuleEnv: { DB },
			cookie,
			params: { client },
			body: { email, password },
		}) => {
			const drizzleService = new DrizzleService(DB);
			const cookieService = new CookieService(APP_ENV === "production", cookie, cookieSchemaObject);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);
			const passwordService = new PasswordService(PASSWORD_PEPPER);

			const sessionRepository = new SessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const loginUseCase = new LoginUseCase(sessionRepository, userRepository, passwordService, sessionTokenService);

			const result = await loginUseCase.execute(email, password);

			if (isErr(result)) {
				const { code } = result;
				switch (code) {
					case "INVALID_EMAIL_OR_PASSWORD":
						throw new BadRequestException({
							name: code,
							message: "Invalid email or password",
						});
					default:
						throw new InternalServerErrorException({
							message: "Unknown LoginUseCase error result.",
						});
				}
			}
			const { session, sessionToken } = result;

			if (client === "mobile") {
				return {
					sessionToken: sessionToken,
				};
			}

			cookieService.setCookie(SESSION_COOKIE_NAME, sessionToken, {
				expires: session.expiresAt,
			});

			return null;
		},
		{
			beforeHandle: async ({ rateLimiter, ip, captcha, body: { email, cfTurnstileResponse } }) => {
				await Promise.all([
					rateLimiter.consume(ip, 1),
					rateLimiter.consume(email, 10),
					captcha.verify(cfTurnstileResponse),
				]);
			},
			cookie: t.Cookie(cookieSchemaObject),
			params: t.Object({
				client: clientSchema,
			}),
			body: t.Object({
				cfTurnstileResponse: t.String(),
				email: t.String({
					format: "email",
				}),
				password: t.String(),
			}),
		},
	);
