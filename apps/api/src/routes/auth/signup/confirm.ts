import { Elysia, t } from "elysia";
import { genderSchema, newGender } from "../../../core/domain/value-objects";
import { defaultCookieOptions } from "../../../core/infra/elysia";
import { SESSION_COOKIE_NAME, SIGNUP_SESSION_COOKIE_NAME } from "../../../core/lib/http";
import { newSignupSessionToken, toAnySessionTokenResponse } from "../../../features/auth";
import { clientTypePlugin } from "../../../plugins/client-type";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";

export const SignupConfirm = new Elysia()

	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientTypePlugin())

	// Route
	.post(
		"/confirm",
		async ({
			cookie,
			body: { signupSessionToken: bodySignupSessionToken, name, password, gender },
			clientType,
			containers,
			status,
		}) => {
			const rawSignupSessionToken =
				clientType === "web" ? cookie[SIGNUP_SESSION_COOKIE_NAME].value : bodySignupSessionToken;

			if (!rawSignupSessionToken) {
				return status("Unauthorized", {
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
					return status("Unauthorized", {
						code: code,
						message: "Signup session token is invalid. Please request signup again.",
					});
				}
				if (code === "SIGNUP_SESSION_EXPIRED") {
					return status("Unauthorized", {
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
					return status("Bad Request", {
						code: code,
						message: "Email is already registered. Please use a different email address or try logging in.",
					});
				}
				if (code === "EMAIL_VERIFICATION_REQUIRED") {
					return status("Bad Request", {
						code: code,
						message: "Email verification is required. Please verify your email address.",
					});
				}
			}

			const { session, sessionToken } = result.value;

			if (clientType === "mobile") {
				return {
					sessionToken: toAnySessionTokenResponse(sessionToken),
				};
			}

			cookie[SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: sessionToken,
				expires: session.expiresAt,
			});

			return status("No Content");
		},
		{
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
			detail: pathDetail({
				operationId: "auth-signup-confirm",
				summary: "Signup Confirm",
				description: "Signup Confirm endpoint for the User",
				tag: "Auth",
			}),
		},
	);
