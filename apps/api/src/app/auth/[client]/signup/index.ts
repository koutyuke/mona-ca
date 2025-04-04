import { t } from "elysia";
import { PasswordService } from "../../../../application/services/password";
import { SessionTokenService } from "../../../../application/services/session-token";
import { SignupUseCase } from "../../../../application/use-cases/auth";
import { SESSION_COOKIE_NAME } from "../../../../common/constants";
import { clientSchema } from "../../../../common/schema";
import { isErr } from "../../../../common/utils";
import { genderSchema, newGender } from "../../../../domain/value-object";
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

export const Signup = new ElysiaWithEnv({
	prefix: "/signup",
})
	// Other Route
	.use(Provider)

	// Local Middleware & Plugin
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
		"/",
		async ({
			env: { APP_ENV, PASSWORD_PEPPER, SESSION_PEPPER },
			cfModuleEnv: { DB },
			cookie,
			params: { client },
			body: { name, email, password, gender },
		}) => {
			const drizzleService = new DrizzleService(DB);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);
			const cookieService = new CookieService(APP_ENV === "production", cookie, cookieSchemaObject);
			const passwordService = new PasswordService(PASSWORD_PEPPER);

			const sessionRepository = new SessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);

			const signupUseCase = new SignupUseCase(sessionRepository, userRepository, passwordService, sessionTokenService);

			const result = await signupUseCase.execute(name, email, password, newGender(gender));

			if (isErr(result)) {
				const { code } = result;
				switch (code) {
					case "EMAIL_IS_ALREADY_USED":
						throw new BadRequestException({
							name: code,
							message: "Email is already used.",
						});
					default:
						throw new InternalServerErrorException({
							message: "Unknown SignupUseCase error result.",
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
			beforeHandle: async ({ rateLimiter, ip, captcha, body: { cfTurnstileResponse } }) => {
				await Promise.all([rateLimiter.consume(ip, 1), captcha.verify(cfTurnstileResponse)]);
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
		},
	);
