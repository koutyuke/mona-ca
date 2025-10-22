import Elysia from "elysia";
import { AuthDIContainer, type IAuthDIContainer } from "../../features/auth";
import { type IUserDIContainer, UserDIContainer } from "../../features/user";
import { CoreDIContainer, type ICoreDIContainer } from "../../shared/di/container";
import {
	type CloudflareBindings,
	type EnvVariables,
	cloudflareBindings,
	envVariables,
} from "../../shared/infra/config/env";

export type ContainerRegister = {
	core: ICoreDIContainer;
	auth: IAuthDIContainer;
	user: IUserDIContainer;
};

type EnvironmentOverride = {
	envVariables: EnvVariables;
	cloudflareBindings: CloudflareBindings;
};

export const di = (override?: Partial<EnvironmentOverride> & Partial<ContainerRegister>) => {
	const _envVariables = override?.envVariables ?? envVariables;
	const _cloudflareBindings = override?.cloudflareBindings ?? cloudflareBindings;

	const core = override?.core ?? new CoreDIContainer(_envVariables, _cloudflareBindings);
	const auth = override?.auth ?? new AuthDIContainer(_envVariables, core);
	const user = override?.user ?? new UserDIContainer(_envVariables, core);

	return new Elysia({
		name: "@mona-ca/di",
	}).decorate("containers", {
		core,
		auth,
		user,
	} satisfies ContainerRegister);
};
