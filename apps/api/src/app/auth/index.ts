import { ElysiaWithEnv } from "@/modules/elysiaWithEnv";
import { Mobile } from "./mobile";
import { Web } from "./web";

const Auth = new ElysiaWithEnv({
	prefix: "/auth",
})
	.use(Mobile)
	.use(Web);

export { Auth };
