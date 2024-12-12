import { UserPresenterResultSchema, userPresenter } from "../../../interface-adapter/presenter";
import { authGuard } from "../../../modules/auth-guard";
import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { Email } from "./email";

const Me = new ElysiaWithEnv({
	prefix: "/@me",
})
	// Other Routes
	.use(Email)

	// Local Middleware & Plugin
	.use(
		authGuard({
			requireEmailVerification: false,
		}),
	)

	// Route
	.get(
		"/",
		({ user }) => {
			return userPresenter(user);
		},
		{
			response: {
				200: UserPresenterResultSchema,
			},
		},
	);

export { Me };
