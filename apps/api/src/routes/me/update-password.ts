import { t } from "elysia";
import { UpdateUserPasswordUseCase } from "../../features/auth";
import { AuthUserRepository } from "../../features/auth/adapters/repositories/auth-user/auth-user.repository";
import { SessionRepository } from "../../features/auth/adapters/repositories/session/session.repository";
import { AuthGuardSchema, authGuard } from "../../plugins/auth-guard";
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
import { PasswordHasher, SessionSecretHasher } from "../../shared/infra/crypto";
import { DrizzleService } from "../../shared/infra/drizzle";
import { CookieManager } from "../../shared/infra/elysia/cookie";
import { SESSION_COOKIE_NAME } from "../../shared/lib/http";

export const UpdatePassword = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(authGuard())

	// Route
	.patch(
		"/password",
		async ({
			env: { PASSWORD_PEPPER, APP_ENV },
			cfModuleEnv: { DB },
			cookie,
			body: { currentPassword, newPassword },
			userIdentity,
			clientType,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const authUserRepository = new AuthUserRepository(drizzleService);
			const sessionRepository = new SessionRepository(drizzleService);

			const passwordHasher = new PasswordHasher(PASSWORD_PEPPER);
			const sessionSecretHasher = new SessionSecretHasher();

			const updateUserPasswordUseCase = new UpdateUserPasswordUseCase(
				authUserRepository,
				sessionRepository,
				passwordHasher,
				sessionSecretHasher,
			);
			// === End of instances ===

			const result = await updateUserPasswordUseCase.execute(userIdentity, currentPassword, newPassword);

			if (result.isErr) {
				const { code } = result;

				if (code === "INVALID_CURRENT_PASSWORD") {
					throw new BadRequestException({
						code: "INVALID_CURRENT_PASSWORD",
						message: "Current password is incorrect. Please check your password and try again.",
					});
				}
				throw new BadRequestException({
					code: code,
					message: "Failed to update password. Please try again.",
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
			headers: AuthGuardSchema.headers,
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				currentPassword: t.Optional(t.String()),
				newPassword: t.String(),
			}),
			response: withBaseResponseSchema({
				200: t.Object({
					sessionToken: t.String(),
				}),
				204: NoContentResponseSchema,
				400: ResponseTUnion(AuthGuardSchema.response[400], ErrorResponseSchema("INVALID_CURRENT_PASSWORD")),
				401: AuthGuardSchema.response[401],
			}),
			detail: pathDetail({
				operationId: "me-update-password",
				summary: "Update Password",
				description: "Update Password endpoint for the User",
				tag: "Me",
				withAuth: true,
			}),
		},
	);
