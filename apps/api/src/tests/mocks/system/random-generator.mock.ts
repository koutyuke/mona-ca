import type { IRandomGenerator, RandomStringOptions } from "../../../application/ports/out/system";

export class RandomGeneratorMock implements IRandomGenerator {
	bytes(_len: number): Uint8Array {
		return new Uint8Array([1, 2, 3, 4]);
	}

	string(_len: number, _opts?: RandomStringOptions): string {
		const value = "random-string";
		return value;
	}

	int(_maxExclusive: number): number {
		const value = 1234;
		return value;
	}
}
