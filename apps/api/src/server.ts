import { Buffer } from "node:buffer";
import { type AppEnv, validateEnv } from "./common/infra/config/env";
import { root } from "./routes";

globalThis.Buffer = Buffer;

validateEnv();

export default {
	fetch: async (request: Request, env: AppEnv) => {
		return root.setEnv(env).fetch(request);
	},
} satisfies ExportedHandler<AppEnv>;
