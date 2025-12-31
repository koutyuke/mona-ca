import { Argon2idService } from "./argon2id";

import type { IPasswordHashingService } from "../../ports/system";

export class PasswordHashingService implements IPasswordHashingService {
	private readonly argon2idService: Argon2idService;
	private readonly pepper: string;

	constructor(pepper: string) {
		this.argon2idService = new Argon2idService();
		this.pepper = pepper;
	}

	async hash(password: string): Promise<string> {
		return await this.argon2idService.hash(password + this.pepper);
	}

	async verify(password: string, hash: string): Promise<boolean> {
		return await this.argon2idService.verify(password + this.pepper, hash);
	}
}
