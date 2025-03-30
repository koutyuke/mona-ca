import { timingSafeEqual } from "node:crypto";

/**
 * Compare two strings in constant time to prevent timing attacks
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if the strings are equal, false otherwise
 */
export const constantTimeCompare = (a: string, b: string): boolean => {
	const aBytes = new TextEncoder().encode(a);
	const bBytes = new TextEncoder().encode(b);

	if (aBytes.length !== bBytes.length) {
		return false;
	}

	return timingSafeEqual(aBytes, bBytes);
};
