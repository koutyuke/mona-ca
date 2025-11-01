import { describe, expect, test } from "vitest";
import { PROD_ORIGIN_REGEX } from "./cors";

describe("PROD_ORIGIN_REGEX", () => {
	describe("正しいケース（マッチする必要がある）", () => {
		test("ルートドメイン（mona-ca.com）", () => {
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com")).toBe(true);
		});

		test("大文字小文字を区別しない", () => {
			expect(PROD_ORIGIN_REGEX.test("https://MONA-CA.COM")).toBe(true);
			expect(PROD_ORIGIN_REGEX.test("https://Mona-Ca.Com")).toBe(true);
			expect(PROD_ORIGIN_REGEX.test("https://mOnA-cA.cOm")).toBe(true);
		});

		test("単一のサブドメイン", () => {
			expect(PROD_ORIGIN_REGEX.test("https://www.mona-ca.com")).toBe(true);
			expect(PROD_ORIGIN_REGEX.test("https://api.mona-ca.com")).toBe(true);
			expect(PROD_ORIGIN_REGEX.test("https://app.mona-ca.com")).toBe(true);
		});

		test("複数のサブドメイン", () => {
			expect(PROD_ORIGIN_REGEX.test("https://sub.domain.mona-ca.com")).toBe(true);
			expect(PROD_ORIGIN_REGEX.test("https://api.v1.mona-ca.com")).toBe(true);
			expect(PROD_ORIGIN_REGEX.test("https://www.api.mona-ca.com")).toBe(true);
		});

		test("サブドメインにハイフンを含む", () => {
			expect(PROD_ORIGIN_REGEX.test("https://api-v1.mona-ca.com")).toBe(true);
			expect(PROD_ORIGIN_REGEX.test("https://my-app.mona-ca.com")).toBe(true);
			expect(PROD_ORIGIN_REGEX.test("https://test-server.mona-ca.com")).toBe(true);
			expect(PROD_ORIGIN_REGEX.test("https://www.mona-ca.com")).toBe(true);
			expect(PROD_ORIGIN_REGEX.test("https://www.app.mona-ca.com")).toBe(true);
		});

		test("サブドメインに数字を含む", () => {
			expect(PROD_ORIGIN_REGEX.test("https://api1.mona-ca.com")).toBe(true);
			expect(PROD_ORIGIN_REGEX.test("https://v2.mona-ca.com")).toBe(true);
			expect(PROD_ORIGIN_REGEX.test("https://server-01.mona-ca.com")).toBe(true);
		});
	});

	describe("間違ったケース（マッチしない必要がある）", () => {
		test("httpプロトコル（httpsが必要）", () => {
			expect(PROD_ORIGIN_REGEX.test("http://mona-ca.com")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("http://www.mona-ca.com")).toBe(false);
		});

		test("パスが含まれている", () => {
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com/")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com/path")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com/api/v1")).toBe(false);
		});

		test("ポート番号が含まれている", () => {
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com:443")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com:8080")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://www.mona-ca.com:3000")).toBe(false);
		});

		test("クエリパラメータが含まれている", () => {
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com?query=value")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com?foo=bar&baz=qux")).toBe(false);
		});

		test("フラグメントが含まれている", () => {
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com#fragment")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com#section")).toBe(false);
		});

		test("異なるドメイン", () => {
			expect(PROD_ORIGIN_REGEX.test("https://evil-mona-ca.com")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com.evil.com")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com.evil")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com.co")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com.malicious.com")).toBe(false);
		});

		test("プレフィックス攻撃（mona-ca.comで始まるが異なるドメイン）", () => {
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com.evil.com")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com.malicious.com")).toBe(false);
		});

		test("サフィックス攻撃（mona-ca.comで終わるが異なるドメイン）", () => {
			expect(PROD_ORIGIN_REGEX.test("https://evilmona-ca.com")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://fake-mona-ca.com")).toBe(false);
		});

		test("不完全なドメイン", () => {
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca.com.")).toBe(false);
		});

		test("空文字列や不正な形式", () => {
			expect(PROD_ORIGIN_REGEX.test("")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("mona-ca.com")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://mona-ca")).toBe(false);
		});

		test("サブドメインに不正な文字が含まれている", () => {
			expect(PROD_ORIGIN_REGEX.test("https://api.mona-ca.com")).toBe(true); // これは正しい
			expect(PROD_ORIGIN_REGEX.test("https://api_.mona-ca.com")).toBe(false); // アンダースコアは許可されていない
			expect(PROD_ORIGIN_REGEX.test("https://api@.mona-ca.com")).toBe(false); // @は許可されていない
			expect(PROD_ORIGIN_REGEX.test("https://api..mona-ca.com")).toBe(false); // 連続するドットは許可されていない
		});

		test("ドメイン名に不正な文字が含まれている", () => {
			expect(PROD_ORIGIN_REGEX.test("https://mona_ca.com")).toBe(false); // アンダースコアは許可されていない
			expect(PROD_ORIGIN_REGEX.test("https://mona.ca.com")).toBe(false); // ドットは許可されていない（ハイフンのみ）
		});

		test("サブドメインが空", () => {
			expect(PROD_ORIGIN_REGEX.test("https://.mona-ca.com")).toBe(false);
			expect(PROD_ORIGIN_REGEX.test("https://..mona-ca.com")).toBe(false);
		});
	});
});
