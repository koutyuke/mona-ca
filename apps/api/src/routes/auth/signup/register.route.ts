import { SESSION_COOKIE_NAME, SIGNUP_SESSION_COOKIE_NAME } from "@mona-ca/core/http";
import { Elysia, t } from "elysia";
import { match } from "ts-pattern";
import { genderSchema, newGender } from "../../../core/domain/value-objects";
import { isMobilePlatform, isWebPlatform } from "../../../core/domain/value-objects";
import { defaultCookieOptions, noContent } from "../../../core/infra/elysia";
import { newSignupSessionToken, toAnyTokenResponse } from "../../../features/auth";
import { clientPlatformPlugin } from "../../../plugins/client-platform";
import { containerPlugin } from "../../../plugins/container";
import { pathDetail } from "../../../plugins/openapi";

export const SignupRegisterRoute = new Elysia()

	// Local Middleware & Plugin
	.use(containerPlugin())
	.use(clientPlatformPlugin())

	// Route
	.post(
		"/register",
		async ({
			cookie,
			body: { signupSessionToken: bodySignupSessionToken, name, password, gender },
			clientPlatform,
			containers,
			status,
		}) => {
			const rawSignupSessionToken = match(clientPlatform)
				.when(isWebPlatform, () => cookie[SIGNUP_SESSION_COOKIE_NAME].value)
				.when(isMobilePlatform, () => bodySignupSessionToken)
				.exhaustive();

			if (!rawSignupSessionToken) {
				return status("Unauthorized", {
					code: "SIGNUP_SESSION_INVALID",
					message: "Signup session token not found. Please request signup again.",
				});
			}

			const validationResult = await containers.auth.signupValidateSessionUseCase.execute(
				newSignupSessionToken(rawSignupSessionToken),
			);

			if (validationResult.isErr) {
				return match(validationResult)
					.with({ code: "SIGNUP_SESSION_INVALID" }, ({ code }) =>
						status("Unauthorized", {
							code: code,
							message: "Signup session token is invalid. Please request signup again.",
						}),
					)
					.with({ code: "SIGNUP_SESSION_EXPIRED" }, ({ code }) =>
						status("Unauthorized", {
							code: code,
							message: "Signup session token has expired. Please request signup again.",
						}),
					)
					.exhaustive();
			}

			const { signupSession } = validationResult.value;

			const result = await containers.auth.signupRegisterUseCase.execute(
				signupSession,
				name,
				password,
				newGender(gender),
			);

			if (result.isErr) {
				return match(result)
					.with({ code: "EMAIL_ALREADY_REGISTERED" }, ({ code }) =>
						status("Bad Request", {
							code: code,
							message: "Email is already registered. Please use a different email address or try logging in.",
						}),
					)
					.with({ code: "EMAIL_VERIFICATION_REQUIRED" }, ({ code }) =>
						status("Bad Request", {
							code: code,
							message: "Email verification is required. Please verify your email address.",
						}),
					)
					.exhaustive();
			}

			const { session, sessionToken } = result.value;

			if (isMobilePlatform(clientPlatform)) {
				return {
					sessionToken: toAnyTokenResponse(sessionToken),
				};
			}

			cookie[SESSION_COOKIE_NAME].set({
				...defaultCookieOptions,
				value: toAnyTokenResponse(sessionToken),
				expires: session.expiresAt,
			});

			return noContent();
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
				operationId: "auth-signup-register",
				summary: "Signup Register",
				description: "Signup Register endpoint for the User",
				tag: "Auth",
			}),
		},
	);
