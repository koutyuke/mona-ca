type Character = "lowercase" | "uppercase" | "digits";

export type RandomStringOptions = {
	[key in Character]: Record<key, true> & Omit<Partial<Record<Character, boolean>>, key>;
}[Character];

export interface ICryptoRandomService {
	bytes(len: number): Uint8Array;
	string(len: number, opts?: RandomStringOptions): string;
	int(maxExclusive: number): number;
}
