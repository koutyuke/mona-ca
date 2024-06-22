import init, { hash, HashOptions, verify } from "../bin/wasm_argon2";

export class Argon2Id {
	private options:
		| {
				memory_cost: number;
				time_cost: number;
				parallelism: number;
		  }
		| undefined;

	private isInitialized = false;

	constructor(args?: {
		memory_cost: number;
		time_cost: number;
		parallelism: number;
	}) {
		this.options = args;
	}

	public async initialize() {
		await init();
		this.isInitialized = true;
	}

	public async hash(password: string): Promise<string> {
		if (!this.isInitialized) {
			await this.initialize();
		}
		const options = this.genHashOptions();
		const hashedPassword = hash(password, options);
		options?.free();
		return hashedPassword;
	}

	public async verify(hashedPassword: string, password: string): Promise<boolean> {
		if (!this.isInitialized) {
			await this.initialize();
		}
		return verify(password, hashedPassword);
	}

	private genHashOptions(): HashOptions | undefined {
		if (!this.options) {
			return undefined;
		}

		const hashOptions = new HashOptions();
		hashOptions.memory_cost = this.options.memory_cost;
		hashOptions.time_cost = this.options.time_cost;
		hashOptions.parallelism = this.options.parallelism;

		return hashOptions;
	}
}
