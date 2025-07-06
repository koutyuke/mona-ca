import type { IPasswordService } from "../../../application/services/password";

export class PasswordServiceMock implements IPasswordService {
	async hashPassword(password: string): Promise<string> {
		return `hashed_${password}`;
	}

	async verifyPassword(password: string, hash: string): Promise<boolean> {
		return hash === `hashed_${password}`;
	}
}
