import { authGuard } from "@/modules/auth-guard";
import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { Email } from "./email";

const Me = new ElysiaWithEnv({
	prefix: "/@me",
})
	// Global Middleware & Plugin
	.use(authGuard)

	// Other Routes
	.use(Email);

export { Me };
