# ブランチ運用ルール

このドキュメントは、リポジトリ内の **ブランチ命名** をチームで統一し、検索性・可読性・リリース運用を向上させるための基準です。

---

## 1. 基本ルール（命名フォーマット）

```text
<Issue Number>-<Type>/<Subject>
```

* **Type**: 変更の性質を表す接頭辞。後述の一覧から選ぶ
* **Subject**: 変更内容の要約（英小文字の kebab-case 推奨）
* **文字種**: 半角英数字・ハイフンのみ（スペース、全角、記号は不可）
* **長さ**: できるだけ 60 文字以内

---

## 2. type の一覧と使いどころ

| type        | 用途の目安                                | 例                              |
| ----------- | ------------------------------------ | ------------------------------ |
| `feat/`     | ユーザーに見える新機能の追加                       | `feat/auth-login-mfa`          |
| `fix/`      | バグ修正                                 | `fix/export-csv-quote`         |
| `enh/`      | 既存機能の改善（UI/UX・使い勝手の向上、機能拡張だが“新機能”未満） | `enh/settings-tooltip-improve` |
| `perf/`     | パフォーマンス改善                            | `perf/api-cache-hit-rate`      |
| `refactor/` | 挙動不変の内部整理・大規模な置き換え                   | `refactor/elysia-2.0-adapt`    |
| `docs/`     | ドキュメントのみ                             | `docs/readme-branch-rules`     |
| `deps/`     | 依存パッケージの更新（機能追加・挙動変更は含まない）           | `deps/elysia-1.9.2`            |
| `sec/`      | セキュリティ対応（CVE 対応など）                   | `sec/elysia-cve-2025-XXXX`     |
| `build/`    | ビルド設定・バンドラ・コンパイル設定                   | `build/vite-split-chunks`      |
| `test/`     | テスト追加・修正                             | `test/e2e-login-flow`          |
| `chore/`    | 上記に当てはまらない雑務（整備・掃除・スクリプト等）           | `chore/cleanup-scripts`        |

---

## 3. Subject の書き方

* **英語の命題句**を kebab-case で（`add`, `enable`, `improve`, `fix` など）
* 3〜7 語程度を目安に簡潔に
* **具体語**を入れる（例：`improve tooltip delay`, `enable http2`, `reduce db roundtrips`）

## 4. PR/コミットとの整合（参考）

* **PR タイトル**は Conventional Commits を推奨：

  * 形式: `type(scope): subject`
  * 例: `chore(deps): bump elysia to 1.9.2`
* **スコープ(scope)** はブランチの `<scope>` と概ね一致させる
* 破壊的変更を含む場合：

  * PR タイトル末尾に `!` を付与（例: `refactor(api)!: adopt elysia v2`）や、本文に `BREAKING CHANGE:` を記載
* 自動リリース（semantic-release 等）を使う場合、`type` の整合が重要

---

## 5. 運用ポリシー

* ブランチは原則 **`main`（または `develop`）から作成**
* マージは **Squash and merge** 推奨（履歴を簡潔に保つ）
* マージ後は **ブランチを削除**（保守コスト削減）
* 命名規則は **README / Contributing ガイド**にも明記し、リポジトリ全体で統一
* コミットメッセージ lint（例：commitlint）・PR テンプレートで補助

---

以上。
