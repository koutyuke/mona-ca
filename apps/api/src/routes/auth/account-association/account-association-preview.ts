import { t } from "elysia";
import { SessionSecretService } from "../../../application/services/session";
import { ValidateAccountAssociationSessionUseCase } from "../../../application/use-cases/account-association/validate-account-association-session.usecase";
import { ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME } from "../../../common/constants";
import { isErr } from "../../../common/utils";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { UserPresenter, UserPresenterResultSchema } from "../../../interface-adapter/presenter";
import { AccountAssociationSessionRepository } from "../../../interface-adapter/repositories/account-association-session";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { CookieManager } from "../../../modules/cookie";
import {
	ElysiaWithEnv,
	ErrorResponseSchema,
	InternalServerErrorResponseSchema,
	ResponseTUnion,
} from "../../../modules/elysia-with-env";
import { BadRequestException, UnauthorizedException } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { WithClientTypeSchema, withClientType } from "../../../modules/with-client-type";

export const AccountAssociationPreview = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)

	// Route
	.post(
		"/association/preview",
		async ({ cookie, body, env: { APP_ENV, ACCOUNT_ASSOCIATION_SESSION_PEPPER }, cfModuleEnv: { DB }, clientType }) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const userRepository = new UserRepository(drizzleService);
			const accountAssociationSessionRepository = new AccountAssociationSessionRepository(drizzleService);
			const accountAssociationSessionSecretService = new SessionSecretService(ACCOUNT_ASSOCIATION_SESSION_PEPPER);

			const validateAccountAssociationSessionUseCase = new ValidateAccountAssociationSessionUseCase(
				userRepository,
				accountAssociationSessionRepository,
				accountAssociationSessionSecretService,
			);
			// === End of instances ===

			const accountAssociationSessionToken =
				clientType === "web"
					? cookieManager.getCookie(ACCOUNT_ASSOCIATION_SESSION_COOKIE_NAME)
					: body?.accountAssociationSessionToken;

			if (!accountAssociationSessionToken) {
				throw new UnauthorizedException({
					code: "ACCOUNT_ASSOCIATION_SESSION_INVALID",
					message: "Account association session not found. Please login again.",
				});
			}

			const result = await validateAccountAssociationSessionUseCase.execute(accountAssociationSessionToken);

			if (isErr(result)) {
				const { code } = result;

				switch (code) {
					case "ACCOUNT_ASSOCIATION_SESSION_INVALID":
						throw new UnauthorizedException({
							code: code,
							message: "Invalid account association session. Please login again.",
						});
					case "ACCOUNT_ASSOCIATION_SESSION_EXPIRED":
						throw new UnauthorizedException({
							code: code,
							message: "Account association session has expired. Please login again.",
						});
					default:
						throw new BadRequestException({
							code: code,
							message: "Account association session validation failed. Please try again.",
						});
				}
			}

			return {
				user: UserPresenter(result.user),
				provider: result.accountAssociationSession.provider,
				providerId: result.accountAssociationSession.providerId,
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
			response: {
				200: t.Object({
					user: UserPresenterResultSchema,
					provider: t.String(),
					providerId: t.String(),
				}),
				400: WithClientTypeSchema.response[400],
				401: ResponseTUnion(
					ErrorResponseSchema("ACCOUNT_ASSOCIATION_SESSION_INVALID"),
					ErrorResponseSchema("ACCOUNT_ASSOCIATION_SESSION_EXPIRED"),
				),
				500: InternalServerErrorResponseSchema,
			},
			detail: pathDetail({
				tag: "Auth - Account Association",
				operationId: "account-association-preview",
				summary: "Account Association Preview",
				description: "Preview the account association",
			}),
		},
	);
