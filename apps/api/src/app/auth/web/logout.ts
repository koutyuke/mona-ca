import { AuthUseCase } from "@/application/use-cases/auth";
import { LuciaAdapter } from "@/infrastructure/lucia";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { InternalServerErrorException } from "@/modules/error/exceptions";
import { SESSION_COOKIE_NAME } from "@mona-ca/core/const";
import { t } from "elysia";

const Logout = new ElysiaWithEnv({
	prefix: "/logout",
})
	// Route
	.post(
		"/",
		async ({ env: { APP_ENV }, cfModuleEnv: { DB }, cookie }) => {
			const authUseCase = new AuthUseCase(APP_ENV === "production", new LuciaAdapter({ db: DB }));

			const sessionCookie = cookie[SESSION_COOKIE_NAME];

			if (!sessionCookie.value) {
				return null;
			}

			try {
				await authUseCase.invalidateSession(sessionCookie.value);
				const blankSessionCookie = authUseCase.createBlankSessionCookie();

				sessionCookie.set({
					value: blankSessionCookie.value,
					...blankSessionCookie.attributes,
				});
			} catch (error) {
				console.error(error);
				throw new InternalServerErrorException({
					message: "Failed to logout",
				});
			}
			return null;
		},
		{
			cookie: t.Cookie({
				[SESSION_COOKIE_NAME]: t.String(),
			}),
		},
	);

export { Logout };
