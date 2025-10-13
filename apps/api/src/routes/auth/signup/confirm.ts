import { t } from "elysia";
import { SignupConfirmUseCase, ValidateSignupSessionUseCase } from "../../../application/use-cases/auth";
import { SESSION_COOKIE_NAME, SIGNUP_SESSION_COOKIE_NAME } from "../../../common/constants";
import { isErr } from "../../../common/utils";
import { genderSchema, newGender, newSignupSessionToken } from "../../../domain/value-object";
import { PasswordHasher, SessionSecretHasher } from "../../../infrastructure/crypt";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { SessionRepository } from "../../../interface-adapter/repositories/session";
import { SignupSessionRepository } from "../../../interface-adapter/repositories/signup-session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { CookieManager } from "../../../modules/cookie";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../modules/elysia-with-env";
import { BadRequestException, UnauthorizedException } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { WithClientTypeSchema, withClientType } from "../../../modules/with-client-type";

export const SignupConfirm = new ElysiaWithEnv()

	// Local Middleware & Plugin
	.use(withClientType)

	// Route
	.post(
		"/confirm",
		async ({
			env: { APP_ENV, PASSWORD_PEPPER },
			cfModuleEnv: { DB },
			cookie,
			body: { signupSessionToken: bodySignupSessionToken, name, password, gender },
			clientType,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const userRepository = new UserRepository(drizzleService);
			const sessionRepository = new SessionRepository(drizzleService);
			const signupSessionRepository = new SignupSessionRepository(drizzleService);

			const sessionSecretHasher = new SessionSecretHasher();
			const passwordHasher = new PasswordHasher(PASSWORD_PEPPER);

			const validateSignupSessionUseCase = new ValidateSignupSessionUseCase(
				signupSessionRepository,
				sessionSecretHasher,
			);
			const signupConfirmUseCase = new SignupConfirmUseCase(
				userRepository,
				sessionRepository,
				signupSessionRepository,
				sessionSecretHasher,
				passwordHasher,
			);
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

			if (isErr(validationResult)) {
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

			const { signupSession } = validationResult;

			const result = await signupConfirmUseCase.execute(signupSession, name, password, newGender(gender));

			if (isErr(result)) {
				const { code } = result;

				if (code === "EMAIL_ALREADY_REGISTERED") {
					throw new BadRequestException({
						code: code,
						message: "Email is already registered. Please use a different email address or try logging in.",
					});
				}
				if (code === "EMAIL_VERIFICATION_REQUIRED") {
					throw new BadRequestException({
						code: code,
						message: "Email verification is required. Please verify your email address.",
					});
				}
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
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[SIGNUP_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				signupSessionToken: t.Optional(t.String()),
				password: t.String({
					minLength: 8,
					maxLength: 64,
				}),
				name: t.String({
					minLength: 1,
					maxLength: 32,
				}),
				gender: genderSchema,
			}),
			response: withBaseResponseSchema({
				200: t.Object({
					sessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: ResponseTUnion(
					WithClientTypeSchema.response[400],
					ErrorResponseSchema("EMAIL_ALREADY_REGISTERED"),
					ErrorResponseSchema("EMAIL_VERIFICATION_REQUIRED"),
				),
			}),
			detail: pathDetail({
				operationId: "auth-signup-confirm",
				summary: "Signup Confirm",
				description: "Signup Confirm endpoint for the User",
				tag: "Auth",
			}),
		},
	);
