import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { Login } from "./login";
import { Logout } from "./logout";
import { Signup } from "./signup";

const Web = new ElysiaWithEnv({
	prefix: "/web",
})
	.use(Login)
	.use(Logout)
	.use(Signup);

export { Web };
