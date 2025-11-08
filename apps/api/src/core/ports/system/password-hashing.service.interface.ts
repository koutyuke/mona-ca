export interface IPasswordHashingService {
	hash(password: string): Promise<string>;
	verify(password: string, hash: string): Promise<boolean>;
}
