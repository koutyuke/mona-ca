import { UserSchema } from "@/domain/user";
import { authGuard } from "@/modules/auth-guard";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { Email } from "./email";

const Me = new ElysiaWithEnv({
	prefix: "/@me",
})
	// Other Routes
	.use(Email)

	// Local Middleware & Plugin
	.use(authGuard())

	// Route
	.get(
		"/",
		({ user }) => {
			return user.toObject();
		},
		{
			response: {
				200: UserSchema,
			},
		},
	);

export { Me };
