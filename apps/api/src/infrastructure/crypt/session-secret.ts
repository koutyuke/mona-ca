import { timingSafeEqual } from "node:crypto";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";

export const generateSessionSecret = (): string => {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	const token = encodeBase32LowerCaseNoPadding(bytes);
	return token;
};

export const hashSessionSecret = (secret: string): Uint8Array => {
	return sha256(new TextEncoder().encode(secret));
};

export const verifySessionSecret = (secret: string, hash: Uint8Array): boolean => {
	const tokenHash = hashSessionSecret(secret);
	return timingSafeEqual(tokenHash, hash);
};
