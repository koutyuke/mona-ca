import { Buffer } from "node:buffer";
import { root } from "./routes";
import { type AppEnv, validateEnv } from "./shared/infra/config/env";

globalThis.Buffer = Buffer;

validateEnv();

export default {
	fetch: async (request: Request, env: AppEnv) => {
		return root.setEnv(env).fetch(request);
	},
} satisfies ExportedHandler<AppEnv>;
