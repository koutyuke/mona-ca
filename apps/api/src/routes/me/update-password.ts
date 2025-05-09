import { t } from "elysia";
import { PasswordService } from "../../application/services/password";
import { SessionTokenService } from "../../application/services/session-token";
import { UpdateUserPasswordUseCase } from "../../application/use-cases/password";
import { SESSION_COOKIE_NAME } from "../../common/constants";
import { FlattenUnion } from "../../common/schemas";
import { isErr } from "../../common/utils";
import { DrizzleService } from "../../infrastructure/drizzle";
import { SessionRepository } from "../../interface-adapter/repositories/session";
import { UserRepository } from "../../interface-adapter/repositories/user";
import { AuthGuardSchema, authGuard } from "../../modules/auth-guard";
import { CookieManager } from "../../modules/cookie";
import { ElysiaWithEnv, NoContentResponse, NoContentResponseSchema } from "../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../modules/error";
import { pathDetail } from "../../modules/open-api";

export const UpdatePassword = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(authGuard())

	// Route
	.patch(
		"/password",
		async ({
			env: { PASSWORD_PEPPER, SESSION_PEPPER, APP_ENV },
			cfModuleEnv: { DB },
			cookie,
			body: { currentPassword, newPassword },
			user,
			clientType,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const passwordService = new PasswordService(PASSWORD_PEPPER);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const userRepository = new UserRepository(drizzleService);
			const sessionRepository = new SessionRepository(drizzleService);
			const sessionTokenService = new SessionTokenService(SESSION_PEPPER);

			const updateUserPasswordUseCase = new UpdateUserPasswordUseCase(
				userRepository,
				sessionRepository,
				passwordService,
				sessionTokenService,
			);
			// === End of instances ===

			const result = await updateUserPasswordUseCase.execute(user, currentPassword, newPassword);

			if (isErr(result)) {
				const { code } = result;

				throw new BadRequestException({
					code,
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
			headers: AuthGuardSchema.headers,
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				currentPassword: t.Optional(t.String()),
				newPassword: t.String(),
			}),
			response: {
				200: t.Object({
					sessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: FlattenUnion(
					AuthGuardSchema.response[400],
					ErrorResponseSchema("INVALID_CURRENT_PASSWORD"),
					ErrorResponseSchema("CURRENT_PASSWORD_IS_REQUIRED"),
				),
				401: AuthGuardSchema.response[401],
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				operationId: "me-update-password",
				summary: "Update Password",
				description: "Update Password endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
