import { t } from "elysia";
import { SessionSecretService } from "../../application/services/session";
import {
	ChangeEmailUseCase,
	ValidateEmailVerificationSessionUseCase,
} from "../../application/use-cases/email-verification";
import { EMAIL_VERIFICATION_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from "../../common/constants";
import { FlattenUnion } from "../../common/schemas";
import { isErr } from "../../common/utils";
import { DrizzleService } from "../../infrastructure/drizzle";
import { EmailVerificationSessionRepository } from "../../interface-adapter/repositories/email-verification-session";
import { SessionRepository } from "../../interface-adapter/repositories/session";
import { UserRepository } from "../../interface-adapter/repositories/user";
import { AuthGuardSchema, authGuard } from "../../modules/auth-guard";
import { CookieManager } from "../../modules/cookie";
import { ElysiaWithEnv, NoContentResponse, NoContentResponseSchema } from "../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../modules/error";
import { pathDetail } from "../../modules/open-api";

export const UpdateEmail = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(authGuard({ requireEmailVerification: false }))

	// Route
	.patch(
		"/email",
		async ({
			env: { EMAIL_VERIFICATION_SESSION_PEPPER, APP_ENV, SESSION_PEPPER },
			cfModuleEnv: { DB },
			cookie,
			body: { code, emailVerificationSessionToken: bodyEmailVerificationSessionToken },
			user,
			clientType,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);
			const sessionSecretService = new SessionSecretService(SESSION_PEPPER);
			const emailVerificationSessionSecretService = new SessionSecretService(EMAIL_VERIFICATION_SESSION_PEPPER);

			const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);
			const sessionRepository = new SessionRepository(drizzleService);

			const validateEmailVerificationSessionUseCase = new ValidateEmailVerificationSessionUseCase(
				emailVerificationSessionRepository,
				emailVerificationSessionSecretService,
			);
			const changeEmailUseCase = new ChangeEmailUseCase(
				userRepository,
				sessionRepository,
				emailVerificationSessionRepository,
				sessionSecretService,
			);
			// === End of instances ===

			const emailVerificationSessionToken =
				clientType === "web"
					? cookieManager.getCookie(EMAIL_VERIFICATION_SESSION_COOKIE_NAME)
					: bodyEmailVerificationSessionToken;

			if (!emailVerificationSessionToken) {
				throw new BadRequestException({
					code: "INVALID_TOKEN",
				});
			}

			const validationResult = await validateEmailVerificationSessionUseCase.execute(emailVerificationSessionToken);

			if (isErr(validationResult)) {
				const { code } = validationResult;

				if (code === "EXPIRED_CODE") {
					throw new BadRequestException({
						code: "EXPIRED_CODE",
						message: "Email verification session has expired.",
					});
				}

				throw new BadRequestException({
					name: code,
					message: "Failed to confirm user email verification.",
				});
			}

			const { emailVerificationSession } = validationResult;

			const changeResult = await changeEmailUseCase.execute(code, user, emailVerificationSession);

			if (isErr(changeResult)) {
				const { code } = changeResult;

				throw new BadRequestException({
					code,
					message: "Failed to change email.",
				});
			}

			const { session, sessionToken } = changeResult;

			if (clientType === "mobile") {
				return {
					sessionToken,
				};
			}

			cookieManager.deleteCookie(EMAIL_VERIFICATION_SESSION_COOKIE_NAME);

			cookieManager.setCookie(SESSION_COOKIE_NAME, sessionToken, {
				expires: session.expiresAt,
			});

			return NoContentResponse();
		},
		{
			headers: AuthGuardSchema.headers,
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
				[EMAIL_VERIFICATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				code: t.String(),
				emailVerificationSessionToken: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({
					sessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: FlattenUnion(
					AuthGuardSchema.response[400],
					ErrorResponseSchema("EMAIL_IS_ALREADY_USED"),
					ErrorResponseSchema("INVALID_CODE"),
					ErrorResponseSchema("EXPIRED_CODE"),
					ErrorResponseSchema("INVALID_TOKEN"),
				),
				401: AuthGuardSchema.response[401],
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				operationId: "me-update-email",
				summary: "Update Email",
				description: "Update Email endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
