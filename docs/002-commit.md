# コミットメッセージ規約

このドキュメントでは、プロジェクトにおけるコミットメッセージの作成規約を定義する。

## 基本原則

- コミットメッセージは全て英語で記述する
- 絵文字を使用して変更の種類を視覚的に表現する
- Conventional Commitsの形式をベースとする

## メッセージ形式

コミットメッセージは以下の形式に従う。

```text
<type>(<scope>)<breaking_change_exclamation>: <description>
```

### 構成要素

#### type（変更の種類）

変更の種類を示す。絵文字とラベルの組み合わせで表現する。

| emoji | label | description |
| --- | --- | --- |
| ✨ | `feat` | 新機能の実装 |
| 🎈 | `feat` | 機能の改善・更新 |
| 🪦 | `feat` | 機能の削除 |
| 📝 | `doc` | ドキュメント変更 |
| 💄 | `style` | スタイル調整（フォーマット、空白、typo など） |
| ♻️ | `refactor` | リファクタリング |
| 🏎️ | `perf` | パフォーマンス向上 |
| 🧪 | `test` | テストコードの追加・修正 |
| 📦️ | `build` | ビルドや依存変更 |
| 🔧 | `chore` | その他の変更 |
| 📦 | `chore` | 依存関係の更新 |
| 🗑 | `chore` | 不要ファイルやコードの削除 |
| 🎉 | `initial` | 最初のコミット |

#### scope（変更対象の範囲）

変更対象の範囲を示す。基本的には3階層までとする（それより小さくなる分には問題ない）。

**形式:** `<application>/<layer>/<detail>`

- `application`: アプリケーションの分類（例: api, mobile, web, packages）
- `layer`: アーキテクチャのレイヤーの分類。基本的にディレクトリ名を使用する（例: domain, models, features, repositories）
- `detail`: エンティティなどの分類。基本的にディレクトリ名を使用する（例: user, order, menu, session）

**scope の例:**

- `api/features/auth`
- `mobile/components/ui`
- `packages/core/utils`
- `api/repositories/session`

#### breaking_change_exclamation（破壊的変更の表記）

破壊的変更（Breaking Changes）がある場合は、scope の後ろに `!` を付ける。

- 破壊的な変更がある場合: `!` を記述
- 破壊的な変更がない場合: 記述しない

#### description（変更の説明）

コミットの簡潔な説明を記述する。

- 64字以内で記述する
- 英語で記述する
- 命令形を使用する（例: "add" ではなく "adds" ではない）
- 先頭は小文字で始める

## コミットメッセージの例

```text
🎈 feat(api/common/constant): add client type constant header and update session expires
```

新機能の追加や改善を行った例。

```text
♻️ refactor(api/repository/session): remove unused SessionConstructor type from session repository interface
```

リファクタリングを行った例。

```text
📝 doc(mobile): update architecture documentation for authentication flow
```

ドキュメントを更新した例。

```text
💄 style(web/components): fix formatting and remove trailing whitespace
```

コードスタイルを調整した例。

## 補足事項

### コミット本文（body）

必要に応じて、コミット本文に詳細な説明を記述できる。

```text
✨ feat(api/features/auth): add two-factor authentication

This commit introduces two-factor authentication using TOTP.
Users can now enable 2FA from their account settings.

- Add TOTP generation and verification
- Update user schema to include 2FA settings
- Add API endpoints for 2FA management
```

### コミットフッター（footer）

破壊的変更の詳細や関連するIssue番号などを記述できる。

```text
♻️ refactor(api/repositories/user)!: change user repository interface

BREAKING CHANGE: The findById method now returns a Promise<User | null>
instead of Promise<User>. All calling code must handle null case.

Fixes #123
Related to #456
```

以上。
