import { ElysiaWithEnv } from "../../modules/elysia-with-env";
import { Me } from "./@me";

const Users = new ElysiaWithEnv({
	prefix: "/users",
}).use(Me);

export { Users };
