import type { IPasswordHasher } from "../../../ports/system";

export class PasswordHasherMock implements IPasswordHasher {
	async hash(password: string): Promise<string> {
		const hash = `__password-hashed:${password}`;
		return hash;
	}

	async verify(password: string, hash: string): Promise<boolean> {
		return hash === (await this.hash(password));
	}
}
