export interface IArgon2idService {
	hash(password: string): Promise<string>;
	verify(password: string, hashedPassword: string): Promise<boolean>;
}
