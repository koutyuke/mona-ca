import { HashOptions, hash, verify } from "../bin/wasm_argon2";

export class Argon2id {
	private options:
		| {
				memory_cost: number;
				time_cost: number;
				parallelism: number;
		  }
		| undefined;

	constructor(args?: {
		memory_cost: number;
		time_cost: number;
		parallelism: number;
	}) {
		this.options = args;
	}

	public async hash(password: string): Promise<string> {
		const option = this.genHashOption();
		const hashedPassword = hash(password, option);
		option?.free();
		return hashedPassword;
	}

	public async verify(hashedPassword: string, password: string): Promise<boolean> {
		return verify(password, hashedPassword);
	}

	private genHashOption(): HashOptions | undefined {
		if (!this.options) {
			return undefined;
		}

		const hashOption = new HashOptions();
		hashOption.memory_cost = this.options.memory_cost;
		hashOption.time_cost = this.options.time_cost;
		hashOption.parallelism = this.options.parallelism;

		return hashOption;
	}
}
