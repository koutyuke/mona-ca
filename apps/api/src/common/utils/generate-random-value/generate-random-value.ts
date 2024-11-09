// ref: https://crypto.oslojs.dev/examples/random-values

import {
	type RandomReader,
	generateRandomIntegerNumber as osloGenerateRandomIntegerNumber,
	generateRandomString as osloGenerateRandomString,
} from "@oslojs/crypto/random";

const lowercaseAlphabetCharacters = "abcdefghijklmnopqrstuvwxyz";

const uppercaseAlphabetCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const numberCharacters = "0123456789";

export const random: RandomReader = {
	read(bytes: Uint8Array): void {
		crypto.getRandomValues(bytes);
	},
};

type Character = "lowercaseAlphabet" | "uppercaseAlphabet" | "number";

/**
 * Generates a random string of the specified length using the provided options.
 *
 * @param length - The length of the random string to generate.
 * @param options - An optional object to specify the character set to use. If you don't provide any options, the generated string will include lowercase alphabetic characters and numbers. But if you provide any of the options, the generated string will only include the specified characters.
 * @param options.uppercaseAlphabet - If true, the generated string will include uppercase alphabetic characters.
 * @param options.lowercaseAlphabet - If true, the generated string will include lowercase alphabetic characters.
 * @param options.numbers - If true, the generated string will include numeric characters.
 * @returns A random string of the specified length.
 * @throws Will throw an error if none of the options are set to true.
 */
export const generateRandomString = (
	length: number,
	options?: {
		[key in Character]: Record<key, true> & Omit<Partial<Record<Character, boolean>>, key>;
	}[Character],
): string => {
	const {
		lowercaseAlphabet = false,
		uppercaseAlphabet = false,
		number = false,
	} = options ?? {
		lowercaseAlphabet: true,
		uppercaseAlphabet: true,
		number: true,
	};

	const characters = [
		lowercaseAlphabet && lowercaseAlphabetCharacters,
		uppercaseAlphabet && uppercaseAlphabetCharacters,
		number && numberCharacters,
	]
		.filter(Boolean)
		.join("");

	return osloGenerateRandomString(random, characters, length);
};

/**
 * Generates a random integer number with the specified length.
 *
 * @param max - The maximum value of the random number to generate.
 * @returns A random integer number with the specified length.
 */
export const generateRandomIntegerNumber = (max: number): number => {
	return osloGenerateRandomIntegerNumber(random, max);
};
