export interface IPasswordService {
	hashPassword(password: string): Promise<string>;
	verifyPassword(password: string, hash: string): Promise<boolean>;
}
