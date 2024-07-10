import { ElysiaWithEnv } from "@/modules/elysiaWithEnv";
import { Login } from "./login";
import { Logout } from "./logout";
import { Signup } from "./signup";

const Mobile = new ElysiaWithEnv({
	prefix: "/mobile",
})
	.use(Login)
	.use(Logout)
	.use(Signup);

export { Mobile };
