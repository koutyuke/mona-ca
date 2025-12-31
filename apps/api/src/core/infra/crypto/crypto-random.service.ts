// ref: https://crypto.oslojs.dev/examples/random-values

import {
	generateRandomIntegerNumber as osloGenerateRandomIntegerNumber,
	generateRandomString as osloGenerateRandomString,
} from "@oslojs/crypto/random";

import type { RandomReader } from "@oslojs/crypto/random";
import type { ICryptoRandomService, RandomStringOptions } from "../../ports/system";

const LOWER = "abcdefghijklmnopqrstuvwxyz";

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const DIGIT = "0123456789";

const READER: RandomReader = {
	read(bytes: Uint8Array): void {
		crypto.getRandomValues(bytes);
	},
};

export class CryptoRandomService implements ICryptoRandomService {
	bytes(len: number): Uint8Array {
		const buf = new Uint8Array(len);
		READER.read(buf);
		return buf;
	}

	/**
	 * Generates a random string of the specified length using the provided options.
	 *
	 * @param length - The length of the random string to generate.
	 * @param options - An optional object to specify the character set to use. If you don't provide any options, the generated string will include lowercase alphabetic characters and numbers. But if you provide any of the options, the generated string will only include the specified characters.
	 * @param options.uppercase - If true, the generated string will include uppercase alphabetic characters.
	 * @param options.lowercase - If true, the generated string will include lowercase alphabetic characters.
	 * @param options.digits - If true, the generated string will include numeric characters.
	 * @returns A random string of the specified length.
	 * @throws Will throw an error if none of the options are set to true.
	 */
	string(length: number, options?: RandomStringOptions): string {
		const {
			lowercase = false,
			uppercase = false,
			digits = false,
		} = options ?? {
			lowercase: true,
			uppercase: true,
			digits: true,
		};

		const characters = `${lowercase ? LOWER : ""}${uppercase ? UPPER : ""}${digits ? DIGIT : ""}`;

		return osloGenerateRandomString(READER, characters, length);
	}

	/**
	 * Generates a random integer number with the specified length.
	 *
	 * @param max - The maximum value of the random number to generate.
	 * @returns A random integer number with the specified length.
	 */
	int(max: number): number {
		return osloGenerateRandomIntegerNumber(READER, max);
	}
}
