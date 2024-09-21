import { ElysiaWithEnv } from "@/modules/elysia-with-env";
import { Email } from "./email";

const Me = new ElysiaWithEnv({
	prefix: "/@me",
})
	// Other Routes
	.use(Email);

export { Me };
