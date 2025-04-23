import { t } from "elysia";
import { AccountAssociationPreviewUseCase } from "../../../application/use-cases/account-association";
import { ACCOUNT_ASSOCIATION_STATE_COOKIE_NAME } from "../../../common/constants";
import { FlattenUnion } from "../../../common/schemas";
import { isErr } from "../../../common/utils";
import { DrizzleService } from "../../../infrastructure/drizzle";
import { UserRepository } from "../../../interface-adapter/repositories/user";
import { CookieManager } from "../../../modules/cookie";
import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { BadRequestException, ErrorResponseSchema, InternalServerErrorResponseSchema } from "../../../modules/error";
import { pathDetail } from "../../../modules/open-api";
import { WithClientTypeSchema, withClientType } from "../../../modules/with-client-type";

export const AccountAssociationPreview = new ElysiaWithEnv()
	// Local Middleware & Plugin
	.use(withClientType)

	// Route
	.post(
		"/association/preview",
		async ({
			cookie,
			body,
			env: { ACCOUNT_ASSOCIATION_STATE_HMAC_SECRET, APP_ENV },
			cfModuleEnv: { DB },
			clientType,
		}) => {
			// === Instances ===
			const drizzleService = new DrizzleService(DB);
			const cookieManager = new CookieManager(APP_ENV === "production", cookie);

			const userRepository = new UserRepository(drizzleService);

			const accountAssociationPreviewUseCase = new AccountAssociationPreviewUseCase(
				{ ACCOUNT_ASSOCIATION_STATE_HMAC_SECRET },
				userRepository,
			);
			// === End of instances ===

			const accountAssociationState =
				clientType === "web"
					? cookieManager.getCookie(ACCOUNT_ASSOCIATION_STATE_COOKIE_NAME)
					: body?.accountAssociationState;

			if (!accountAssociationState) {
				throw new BadRequestException({
					code: "INVALID_STATE",
				});
			}

			const result = await accountAssociationPreviewUseCase.execute(accountAssociationState);

			if (isErr(result)) {
				throw new BadRequestException({
					code: result.code,
				});
			}

			return {
				userId: result.user.id,
				email: result.user.email,
				provider: result.provider,
				providerId: result.providerId,
			};
		},
		{
			headers: WithClientTypeSchema.headers,
			cookie: t.Cookie({
				[ACCOUNT_ASSOCIATION_STATE_COOKIE_NAME]: t.Optional(t.String()),
			}),
			body: t.Object({
				accountAssociationState: t.Optional(t.String()),
			}),
			response: {
				200: t.Object({
					userId: t.String(),
					email: t.String(),
					provider: t.String(),
					providerId: t.String(),
				}),
				400: FlattenUnion(
					WithClientTypeSchema.response[400],
					ErrorResponseSchema("INVALID_STATE"),
					ErrorResponseSchema("EXPIRED_STATE"),
					ErrorResponseSchema("USER_NOT_FOUND"),
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
