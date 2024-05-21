import { error } from "@/plugins/error";
import { ElysiaWithEnv } from "../modules/elysiaWithEnv";
import type { FetchHandlerEnv } from "../types/handlers";

const root = new ElysiaWithEnv({
	aot: false,
});

root.use(error).get("/", () => {
	return "Hello, World!";
});

export default {
	fetch: (request: Request, env: FetchHandlerEnv) => {
		return root.setEnv(env).fetch(request);
	},
};
