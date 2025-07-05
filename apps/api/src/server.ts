import { Buffer } from "node:buffer";
import type { AppEnv } from "./modules/env";
import { root } from "./routes";

globalThis.Buffer = Buffer;

export default {
	fetch: async (request: Request, env: AppEnv) => {
		return root.setEnv(env).fetch(request);
	},
} satisfies ExportedHandler<AppEnv>;
