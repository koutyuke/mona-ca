import { t } from "elysia";
import { AccountAssociationSessionRepository } from "../../../features/auth/adapters/repositories/account-association-session/account-association-session.repository";
import { AuthUserRepository } from "../../../features/auth/adapters/repositories/auth-user/auth-user.repository";
import { ValidateAccountAssociationSessionUseCase } from "../../../features/auth/application/use-cases/account-association/validate-account-association-session.usecase";
import { newAccountAssociationSessionToken } from "../../../features/auth/domain/value-objects/session-token";
import { GetProfileUseCase } from "../../../features/user";
import { ProfileResponseSchema, toProfileResponse } from "../../../features/user/adapters/presenters/profile.presenter";
import { ProfileRepository } from "../../../features/user/adapters/repositories/profile/profile.repository";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	ResponseTUnion,
	withBaseResponseSchema,
} from "../../../plugins/elysia-with-env";
import { BadRequestException, UnauthorizedException } from "../../../plugins/error";
import { pathDetail } from "../../../plugins/open-api";
import { WithClientTypeSchema, withClientType } from "../../../plugins/with-client-type";
import { SessionSecretHasher } from "../../../shared/infra/crypto";
import { DrizzleService } from "../../../shared/infra/drizzle";
import { CookieManager } from "../../../shared/infra/elysia/cookie";
import { ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME } from "../../../shared/lib/http";

export const AccountAssociationPreview = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)

	// Route
	.post(
		"/association/preview",
		async ({ cookie, body, env: { APP_ENV }, cfModuleEnv: { DB }, clientType }) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const authUserRepository = new AuthUserRepository(drizzleService);
			const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);
			const profileRepository = new ProfileRepository(drizzleService);

			const sessionSecretHasher = new SessionSecretHasher();

			const validateAccountAssociationSessionUseCase = new ValidateAccountAssociationSessionUseCase(
				authUserRepository,
				accountAssociationSessionRepository,
				sessionSecretHasher,
			);
			const getProfileUseCase = new GetProfileUseCase(profileRepository);
			// === End of instances ===

			const rawAccountAssociationSessionToken =
				clientType === "web"
					? cookieManager.getCookie(ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME)
					: body?.accountAssociationSessionToken;

			if (!rawAccountAssociationSessionToken) {
				throw new UnauthorizedException({
					code: "ACCOUNT_ASSOCIATION_SESSION_INVALID",
					message: "Account association session not found. Please login again.",
				});
			}

			const result = await validateAccountAssociationSessionUseCase.execute(
				newAccountAssociationSessionToken(rawAccountAssociationSessionToken),
			);

			if (result.isErr) {
				const { code } = result;

				if (code === "ACCOUNT_ASSOCIATION_SESSION_INVALID") {
					throw new UnauthorizedException({
						code: code,
						message: "Invalid account association session. Please login again.",
					});
				}
				if (code === "ACCOUNT_ASSOCIATION_SESSION_EXPIRED") {
					throw new UnauthorizedException({
						code: code,
						message: "Account association session has expired. Please login again.",
					});
				}
			}

			const { userIdentity, accountAssociationSession } = result.value;

			const profile = await getProfileUseCase.execute(userIdentity.id);
			if (profile.isErr) {
				throw new BadRequestException({
					code: profile.code,
					message: "Failed to get profile",
				});
			}

			return {
				user: toProfileResponse(profile.value.profile),
				provider: accountAssociationSession.provider,
				providerId: accountAssociationSession.providerUserId,
			};
		},
		{
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie({
				[ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				accountAssociationSessionToken: t.Optional(t.String()),
			}),
			response: withBaseResponseSchema({
				200: t.Object({
					user: ProfileResponseSchema,
					provider: t.String(),
					providerId: t.String(),
				}),
				400: WithClientTypeSchema.response[400],
				401: ResponseTUnion(
					ErrorResponseSchema("PROFILE_NOT_FOUND"),
					ErrorResponseSchema("ACCOUNT_ASSOCIATION_SESSION_INVALID"),
					ErrorResponseSchema("ACCOUNT_ASSOCIATION_SESSION_EXPIRED"),
				),
			}),
			detail: pathDetail({
				tag: "Auth - Account Association",
				operationId: "account-association-preview",
				summary: "Account Association Preview",
				description: "Preview the account association",
			}),
		},
	);
