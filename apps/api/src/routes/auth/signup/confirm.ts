import { Elysia, t } from "elysia";
import { newSignupSessionToken } from "../../../features/auth";
import { di } from "../../../plugins/di";
import { pathDetail } from "../../../plugins/open-api";
import { WithClientTypeSchema, withClientType } from "../../../plugins/with-client-type";
import { genderSchema, newGender } from "../../../shared/domain/value-objects";
import { env } from "../../../shared/infra/config/env";
import {
	BadRequestException,
	CookieManager,
	ErrorResponseSchema,
	NoContentResponse,
	NoContentResponseSchema,
	ResponseTUnion,
	UnauthorizedException,
	withBaseResponseSchema,
} from "../../../shared/infra/elysia";
import { SESSION_COOKIE_NAME, SIGNUP_SESSION_COOKIE_NAME } from "../../../shared/lib/http";

export const SignupConfirm = new Elysia()

	// Local Middleware & Plugin
	.use(di())
	.use(withClientType)

	// Route
	.post(
		"/confirm",
		async ({
			cookie,
			body: { signupSessionToken: bodySignupSessionToken, name, password, gender },
			clientType,
			containers,
		}) => {
			const cookieManager = new CookieManager(env.APP_ENV === "production", cookie);

			const rawSignupSessionToken =
				clientType === "web" ? cookieManager.getCookie(SIGNUP_SESSION_COOKIE_NAME) : bodySignupSessionToken;

			if (!rawSignupSessionToken) {
				throw new UnauthorizedException({
					code: "SIGNUP_SESSION_INVALID",
					message: "Signup session token not found. Please request signup again.",
				});
			}

			const validationResult = await containers.auth.validateSignupSessionUseCase.execute(
				newSignupSessionToken(rawSignupSessionToken),
			);

			if (validationResult.isErr) {
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

			const { signupSession } = validationResult.value;

			const result = await containers.auth.signupConfirmUseCase.execute(
				signupSession,
				name,
				password,
				newGender(gender),
			);

			if (result.isErr) {
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
