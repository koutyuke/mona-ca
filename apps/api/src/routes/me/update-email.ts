import { t } from "elysia";
import { SessionTokenService } from "../../application/services/session-token";
import { ChangeEmailUseCase } from "../../application/use-cases/email-verification/change-email.usecase";
import { SESSION_COOKIE_NAME } from "../../common/constants";
import { isErr } from "../../common/utils";
import { DrizzleService } from "../../infrastructure/drizzle";
import { EmailVerificationSessionRepository } from "../../interface-adapter/repositories/email-verification-session";
import { SessionRepository } from "../../interface-adapter/repositories/session";
import { UserRepository } from "../../interface-adapter/repositories/user";
import { AuthGuardSchema, authGuard } from "../../modules/auth-guard";
import { CookieService } from "../../modules/cookie";
import { ElysiaWithEnv } from "../../modules/elysia-with-env";
import { BadRequestException, InternalServerErrorResponseSchema } from "../../modules/error";
import { pathDetail } from "../../modules/open-api";
import { WithClientTypeSchema, withClientType } from "../../modules/with-client-type";

const cookieSchemaObject = {
	[SESSION_COOKIE_NAME]: t.Optional(t.String()),
};

export const UpdateEmail = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)
	.use(authGuard({ requireEmailVerification: false }))

	// Route
	.patch(
		"/email",
		async ({
			env: { EMAIL_VERIFICATION_SESSION_PEPPER, APP_ENV },
			cfModuleEnv: { DB },
			cookie,
			body: { code, email, emailVerificationSessionToken },
			user,
			clientType,
			set,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieService = new CookieService(APP_ENV === "production", cookie, cookieSchemaObject);
			const sessionTokenService = new SessionTokenService(EMAIL_VERIFICATION_SESSION_PEPPER);

			const emailVerificationSessionRepository = new EmailVerificationSessionRepository(drizzleService);
			const userRepository = new UserRepository(drizzleService);
			const sessionRepository = new SessionRepository(drizzleService);

			const changeEmailUseCase = new ChangeEmailUseCase(
				userRepository,
				sessionRepository,
				emailVerificationSessionRepository,
				sessionTokenService,
			);
			// === End of instances ===

			const result = await changeEmailUseCase.execute(emailVerificationSessionToken, email, code, user);

			if (isErr(result)) {
				const { code } = result;

				throw new BadRequestException({
					name: code,
					message: "Failed to change email.",
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

			set.status = 204;
			return;
		},
		{
			cookie: t.Cookie(cookieSchemaObject),
			body: t.Object({
				email: t.String({
					format: "email",
				}),
				code: t.String(),
				emailVerificationSessionToken: t.String(),
			}),
			response: {
				200: t.Object({
					sessionToken: t.String(),
				}),
				204: t.Void(),
				400: WithClientTypeSchema.response[400],
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
