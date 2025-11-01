import Elysia from "elysia";
import { CoreDIContainer, type ICoreDIContainer } from "../../core/di/container";
import {
	type CloudflareBindings,
	type EnvVariables,
	cloudflareBindings,
	envVariables,
} from "../../core/infra/config/env";
import { AuthDIContainer, type IAuthDIContainer } from "../../features/auth";
import { type IUserDIContainer, UserDIContainer } from "../../features/user";

export type DIContainers = {
	core: ICoreDIContainer;
	auth: IAuthDIContainer;
	user: IUserDIContainer;
};

type EnvironmentOverride = {
	envVariables: EnvVariables;
	cloudflareBindings: CloudflareBindings;
};

export const containerPlugin = (override?: Partial<EnvironmentOverride> & Partial<DIContainers>) => {
	const _envVariables = override?.envVariables ?? envVariables;
	const _cloudflareBindings = override?.cloudflareBindings ?? cloudflareBindings;

	const core = override?.core ?? new CoreDIContainer(_envVariables, _cloudflareBindings);
	const auth = override?.auth ?? new AuthDIContainer(_envVariables, core);
	const user = override?.user ?? new UserDIContainer(_envVariables, core);

	return new Elysia({
		name: "@mona-ca/container",
	}).decorate("containers", {
		core,
		auth,
		user,
	} satisfies DIContainers);
};
