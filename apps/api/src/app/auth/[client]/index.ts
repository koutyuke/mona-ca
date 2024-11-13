import { ElysiaWithEnv } from "../../../modules/elysia-with-env";
import { Login } from "./login";
import { Logout } from "./logout";
import { Signup } from "./signup";

export const Client = new ElysiaWithEnv({
	prefix: "/:client",
})
	// Other Routes
	.use(Signup)
	.use(Login)
	.use(Logout);
