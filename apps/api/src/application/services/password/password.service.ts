import { Argon2idService, type IArgon2idService } from "../../../infrastructure/argon2id";
import type { IPasswordService } from "./interfaces/password.service.interface";

export class PasswordService implements IPasswordService {
	private readonly argon2idService: IArgon2idService;
	private readonly pepper: string;

	constructor(pepper: string) {
		this.argon2idService = new Argon2idService();
		this.pepper = pepper;
	}

	public async hashPassword(password: string): Promise<string> {
		return this.argon2idService.hash(password + this.pepper);
	}

	public async verifyPassword(password: string, hash: string): Promise<boolean> {
		return this.argon2idService.verify(password + this.pepper, hash);
	}
}
