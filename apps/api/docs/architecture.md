# アーキテクチャ設計

mona-ca Backend APIのアーキテクチャ設計とディレクトリ構成を説明する。

> 📖 **関連ドキュメント**
>
> - [README](./README.md) - ドキュメント目次
> - [実装ガイド](./guides.md) - 実装規約とテスト戦略
> - [参考資料](./references.md) - 補足情報と参考リソース

## 目次

- [概要](#概要)
- [技術スタック](#技術スタック)
- [アーキテクチャパターン](#アーキテクチャパターン)
- [ディレクトリ構成](#ディレクトリ構成)
- [レイヤー間の依存関係](#レイヤー間の依存関係)

## 概要

mona-ca Backend APIは、Clean Architectureをベースとした多層アーキテクチャを採用している。
各レイヤーが明確な責務を持ち、依存関係の方向が一方通行になるよう設計されている。

### 設計原則

- **Clean Architecture**: ビジネスロジックをフレームワークやインフラから独立させる
- **Repository Pattern**: データアクセスロジックを抽象化
- **SOLID Principles**: 保守性と拡張性を高める設計原則
- **Dependency Injection**: 依存関係を外部から注入し、テスタビリティを向上
- **Feature-based Organization**: ドメイン機能ごとにコードを整理

## 技術スタック

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| Runtime | Bun | JavaScript/TypeScriptランタイム |
| Platform | Cloudflare Workers | エッジコンピューティング環境 |
| Framework | ElysiaJS | Web API Framework |
| ORM | Drizzle ORM | データベースアクセス |
| Database | Cloudflare D1 | SQLiteベースのサーバーレスDB |
| Auth Core | Lucia | 認証ライブラリ（参考実装） |
| Auth Utils | Oslo | 認証系ユーティリティ |
| OAuth | Arctic | OAuth 2.0クライアント |
| Email | Resend | メール送信API |
| Rate Limiting | Upstash Rate Limit | レート制限 |
| Cache | Upstash Redis | キャッシュストア |
| Password Hashing | Argon2id (WASM) | パスワードハッシュ化 |
| Testing | Vitest | テストフレームワーク |
| Linter/Formatter | Biome | コード品質管理 |

## アーキテクチャパターン

### レイヤー構造

```text
┌─────────────────────────────────────┐
│         Presentation Layer          │  routes/
│        (ElysiaJS Routes)            │
├─────────────────────────────────────┤
│        Adapter Layer                │  features/*/adapters/
│  (Presenters, Repositories,         │
│   Gateways)                         │
├─────────────────────────────────────┤
│        Application Layer            │  features/*/application/
│  (Use Cases, Contracts, Ports)      │
├─────────────────────────────────────┤
│         Domain Layer                │  features/*/domain/
│  (Entities, Value Objects)          │
├─────────────────────────────────────┤
│      Infrastructure Layer           │  core/infra/
│  (Drizzle, Crypto, Config)          │
└─────────────────────────────────────┘
```

### 各レイヤーの責務

#### 1. Presentation Layer (`routes/`)

- HTTPリクエスト/レスポンスのハンドリング
- ルーティング定義
- リクエストバリデーション（Elysiaスキーマ）
- OpenAPI/Swagger定義
- Pluginの適用（CORS, Auth Guard, Rate Limit等）

**ルール**:

- UseCaseの実行と結果のハンドリングのみを行う
- ビジネスロジックを含まない
- DIコンテナから必要な依存関係を取得
- Presenterを使用してレスポンスを整形

#### 2. Adapter Layer (`features/*/adapters/`)

外部システムやインフラとドメイン層を繋ぐ変換層。

**Repositories** (`repositories/`):

- ドメインエンティティとデータベーステーブルの変換
- Repository Interfaceの実装
- Drizzle ORMを使用したCRUD操作

**Presenters** (`presenters/`):

- ドメインエンティティをHTTPレスポンスに変換
- レスポンススキーマの定義
- データの整形（日付フォーマット、null処理等）

**Gateways** (`gateways/`):

- 外部APIとの通信（OAuth Provider, Email, Turnstile等）
- Gateway Interfaceの実装

#### 3. Application Layer (`features/*/application/`)

アプリケーションのユースケースを実装。

**Use Cases** (`use-cases/`):

- ビジネスユースケースの実装
- 複数のRepositoryやGatewayを組み合わせ
- トランザクション境界の定義
- エラーハンドリング
- Result型（`ok()`, `err()`）での結果返却

**Contracts** (`contracts/`):

- UseCaseのInterface定義
- 入力/出力型の定義

**Ports** (`ports/`):

- Repository Interfaceの定義
- Gateway Interfaceの定義
- 他のサービスInterface定義

#### 4. Domain Layer (`features/*/domain/`)

ビジネスロジックの中核。フレームワークやインフラに依存しない。

**Entities** (`entities/`):

- ビジネスエンティティの定義
- エンティティのバリデーションロジック
- ドメインロジック

**Value Objects** (`value-objects/`):

- 不変な値オブジェクト
- バリデーションロジック
- IDやセッショントークン等

#### 5. Infrastructure Layer (`core/infra/`)

技術的な基盤を提供。

- **Config**: 環境変数管理、バリデーション
- **Crypto**: パスワードハッシュ化、HMAC、乱数生成
- **Drizzle**: DBスキーマ定義、マイグレーション
- **Elysia**: レスポンスヘルパー、Cookie管理、例外クラス

## ディレクトリ構成

```text
apps/api/
├── src/
│   ├── core/                      # 共通インフラ・ライブラリ
│   │   ├── adapters/              # 共通ゲートウェイ実装
│   │   │   └── gateways/
│   │   │       ├── email/
│   │   │       └── turnstile/
│   │   ├── di/                    # コアDIコンテナ
│   │   │   └── container.ts
│   │   ├── domain/                # 共通ドメインオブジェクト
│   │   │   └── value-objects/
│   │   ├── infra/                 # インフラ実装
│   │   │   ├── config/            # 環境変数管理
│   │   │   ├── crypto/            # 暗号化関連
│   │   │   ├── drizzle/           # DB・スキーマ定義
│   │   │   └── elysia/            # Elysia拡張
│   │   ├── lib/                   # 共通ライブラリ
│   │   │   └── ...
│   │   ├── ports/                 # 共通ポート（インターフェース）
│   │   │   ├── gateways/
│   │   │   └── system/
│   │   └── testing/               # 共通テストヘルパー・モック
│   │       ├── helpers/
│   │       └── mocks/
│   │
│   ├── features/                  # 機能モジュール
│   │   └── [Slug]/                # 各スライス
│   │       ├── adapters/          # アダプター層
│   │       │   ├── gateways/
│   │       │   ├── presenters/
│   │       │   └── repositories/
│   │       ├── application/       # アプリケーション層
│   │       │   ├── contracts/     # UseCaseインターフェース
│   │       │   ├── infra/         # Feature固有のインフラ
│   │       │   ├── ports/         # Repository/Gatewayインターフェース
│   │       │   └── use-cases/     # UseCaseの実装
│   │       ├── di/                # Feature固有のDIコンテナ
│   │       │   ├── container.interface.ts
│   │       │   └── container.ts
│   │       ├── domain/            # ドメイン層
│   │       │   ├── entities/
│   │       │   └── value-objects/
│   │       ├── lib/               # Feature固有のユーティリティ
│   │       ├── testing/           # テストサポート
│   │       │   ├── fixtures/
│   │       │   ├── helpers/
│   │       │   └── mocks/
│   │       └── index.ts           # Feature公開API
│   │
│   ├── plugins/                   # Elysiaプラグイン
│   │   ├── auth-guard/            # 認証ガード
│   │   ├── captcha/               # CAPTCHA検証
│   │   ├── cors/                  # CORS設定
│   │   ├── di/                    # DI Plugin
│   │   ├── error/                 # エラーハンドリング
│   │   ├── open-api/              # OpenAPI/Swagger
│   │   ├── rate-limit/            # レート制限
│   │   └── with-client-type/      # クライアントタイプ判定
│   │
│   ├── routes/                    # ルート定義
│   │   ├── [Slug]/                # 各スライス
│   │   │   └── index.ts           # スライス公開API
│   │   └── index.ts               # ルートエントリポイント
│   │
│   └── index.ts                   # アプリケーションエントリポイント
│
├── tests/                         # E2Eテスト
├── drizzle/                       # マイグレーションファイル
├── types/                         # global types定義
├── docs/                          # ドキュメント
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── wrangler.jsonc                 # Cloudflare Workers設定
└── drizzle.config.ts              # Drizzle設定
```

### Feature構造の詳細

各featureは独立したモジュールとして機能する。

```text
features/[feature-name]/
├── adapters/
│   ├── gateways/          # 外部API通信の実装
│   ├── presenters/        # レスポンス変換
│   └── repositories/      # データアクセス実装
│       └── [entity]/
│           ├── [entity].repository.ts
│           └── tests/
│               ├── create.test.ts
│               ├── find-by-id.test.ts
│               └── ...
├── application/
│   ├── contracts/         # UseCaseのInterface定義
│   │   └── [domain]/
│   │       └── [action].usecase.interface.ts
│   ├── infra/            # Feature固有のインフラ実装
│   ├── ports/            # Repository/GatewayのInterface
│   │   ├── gateways/
│   │   ├── repositories/
│   │   └── infra/
│   └── use-cases/        # UseCaseの実装
│       └── [domain]/
│           ├── [action].usecase.ts
│           └── [action].usecase.test.ts
├── di/
│   ├── container.interface.ts    # DIコンテナInterface
│   └── container.ts              # DIコンテナ実装
├── domain/
│   ├── entities/         # ビジネスエンティティ
│   └── value-objects/    # 値オブジェクト
├── lib/                  # Feature固有のヘルパー
├── testing/              # テストサポート
│   ├── fixtures/         # テストデータ生成
│   ├── helpers/          # テストヘルパー
│   └── mocks/           # モック実装
│       ├── gateways/
│       ├── repositories/
│       └── infra/
└── index.ts             # Feature公開API
```

## レイヤー間の依存関係

### 依存関係の方向

```text
routes → adapters → application → domain
  ↓         ↓           ↓
plugins   core/infra   core/lib
```

**重要な原則**:

- **Domain層は何にも依存しない**（純粋なビジネスロジック）
- **Application層はDomain層のみに依存**
- **Adapter層はApplication層とDomain層に依存**
- **Presentation層は全てに依存可能**だが、直接Domain層にアクセスしない
- **依存関係はInterfaceを通して行う**（Dependency Inversion Principle）

### データフロー

#### リクエスト処理フロー

```text
1. Route (Presentation)
   ↓ DIからUseCaseを取得
2. UseCase (Application)
   ↓ Repositoryを呼び出し
3. Repository (Adapter)
   ↓ Drizzle ORMでDB操作
4. DrizzleService (Infrastructure)
   ↓ データ取得
5. Repository (Adapter)
   ↓ Entity変換
6. UseCase (Application)
   ↓ ビジネスロジック処理
7. Route (Presentation)
   ↓ Presenterで変換
8. Response
```

#### エラーハンドリングフロー

```text
1. UseCase内でエラー発生
   ↓ Result型で`err()`を返す
2. Route層でResult型を判定
   ↓ エラー時は例外をthrow
3. Error Plugin
   ↓ 適切なHTTPステータスとメッセージを返す
4. Error Response
```
