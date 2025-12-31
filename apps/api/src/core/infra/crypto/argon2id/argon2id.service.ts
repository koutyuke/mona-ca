import { HashOptions, hash, verify } from "./bin/wasm_argon2";

import type { IArgon2idService } from "../../../ports/system";

export class Argon2idService implements IArgon2idService {
	private readonly hashOption: HashOptions | undefined;

	constructor(args?: {
		memory_cost: number;
		time_cost: number;
		parallelism: number;
	}) {
		if (args) {
			const hashOption = new HashOptions();
			hashOption.memory_cost = args.memory_cost;
			hashOption.time_cost = args.time_cost;
			hashOption.parallelism = args.parallelism;
			this.hashOption = hashOption;
		}
	}

	public async hash(str: string): Promise<string> {
		const option = this.hashOption;
		const hashedStr = hash(str, option);
		option?.free();
		return hashedStr;
	}

	public async verify(password: string, hashedPassword: string): Promise<boolean> {
		return verify(password, hashedPassword);
	}
}
