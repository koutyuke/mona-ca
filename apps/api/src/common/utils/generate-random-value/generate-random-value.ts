// ref: https://crypto.oslojs.dev/examples/random-values

import {
	type RandomReader,
	generateRandomIntegerNumber as osloGenerateRandomIntegerNumber,
	generateRandomString as osloGenerateRandomString,
} from "@oslojs/crypto/random";

const alphabetCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const numberCharacters = "0123456789";

export const random: RandomReader = {
	read(bytes: Uint8Array): void {
		crypto.getRandomValues(bytes);
	},
};

export const generateRandomString = (
	length: number,
	options?: {
		alphabet?: boolean;
		numbers?: boolean;
	},
): string => {
	const { alphabet = true, numbers = true } = options ?? {};

	const characters = (alphabet ? alphabetCharacters : "") + (numbers ? numberCharacters : "");

	return osloGenerateRandomString(random, characters, length);
};

export const generateRandomIntegerNumber = (length: number): number => {
	return osloGenerateRandomIntegerNumber(random, length);
};
