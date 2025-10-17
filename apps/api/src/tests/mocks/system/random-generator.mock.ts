import type { IRandomGenerator, RandomStringOptions } from "../../../common/ports/system";

type Character = "lowercase" | "uppercase" | "digits";

export class RandomGeneratorMock implements IRandomGenerator {
	/** [1,2,...,len] を返す（Uint8Arrayなので256超は自然にラップ） */
	bytes(len: number): Uint8Array {
		if (len <= 0) return new Uint8Array();
		return Uint8Array.from({ length: len }, (_, i) => (i + 1) & 0xff);
	}

	/**
	 * lowercase/uppercase/digits のうち opts で true のカテゴリだけを使い、
	 * 順番（lower→upper→digits）で循環しながら len 文字を生成。
	 * 各カテゴリの文字は独立に a→b→c... / A→B... / 0→1... と進む。
	 * 例）全true & len=6 => aA1bB2
	 */
	string(len: number, opts?: RandomStringOptions): string {
		if (len <= 0) return "";

		const order: Character[] = ["lowercase", "uppercase", "digits"];
		const enabled = order.filter(k => Boolean((opts as RandomStringOptions)?.[k]));
		// 何もtrueでない場合は小文字のみを既定とする
		const cats = enabled.length > 0 ? enabled : (["lowercase"] as Character[]);

		const lowers = "abcdefghijklmnopqrstuvwxyz";
		const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const digits = "0123456789";

		const idx = { lowercase: 0, uppercase: 0, digits: 0 } as Record<Character, number>;

		const pick = (cat: Character): string => {
			switch (cat) {
				case "lowercase": {
					const c = lowers[idx.lowercase % lowers.length];
					idx.lowercase++;
					return c!;
				}
				case "uppercase": {
					const c = uppers[idx.uppercase % uppers.length];
					idx.uppercase++;
					return c!;
				}
				case "digits": {
					const c = digits[idx.digits % digits.length];
					idx.digits++;
					return c!;
				}
			}
		};

		let out = "";
		for (let i = 0; i < len; i++) {
			const cat = cats[i % cats.length]; // 指定順で循環
			out += pick(cat!);
		}
		return out;
	}

	int(max: number): number {
		return Math.floor(max / 2);
	}
}
