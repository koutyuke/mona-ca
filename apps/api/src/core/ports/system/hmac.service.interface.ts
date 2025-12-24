export type MacEncoding = "base64" | "hex" | "base64url";

export type MacOptions = {
	encoding?: MacEncoding;
};

export interface IHmacService {
	sign(plaintext: string, opts?: MacOptions): string;
	verify(plaintext: string, mac: string, opts?: MacOptions): boolean;
}
