import { ElysiaWithEnv } from "../../modules/elysia-with-env";
import { Client } from "./[client]";

const Auth = new ElysiaWithEnv({
	prefix: "/auth",
})
	// Other Routes
	.use(Client);

export { Auth };
