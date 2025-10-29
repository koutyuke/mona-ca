# アーキテクチャ設計

mona-ca Mobile Frontendのアーキテクチャ設計とディレクトリ構成を説明する。

> 📖 **関連ドキュメント**
>
> - [README](./README.md) - ドキュメント目次
> - [実装ガイド](./guides.md) - 実装規約とテスト戦略
> - [参考資料](./references.md) - 補足情報と参考リソース

## 目次

- [概要](#概要)
- [技術スタック](#技術スタック)
- [Feature-Sliced Design (FSD)](#feature-sliced-design-fsd)
- [ディレクトリ構成](#ディレクトリ構成)
- [レイヤー間の依存関係](#レイヤー間の依存関係)
- [公開API設計](#公開api設計)

## 概要

mona-ca Mobile Frontendは、Feature-Sliced Design (FSD)とPresenter/Container Patternを組み合わせたアーキテクチャを採用している。これにより、スケーラブルで保守性の高いコードベースを実現する。

### 設計原則

- **Feature-Sliced Design**: 機能ごとにコードを整理し、レイヤー間の依存関係を明確にする
- **Presenter/Container Pattern**: UIとロジックを分離し、テスタビリティを向上させる
- **Composition over Inheritance**: コンポーネントの合成により柔軟性を高める
- **UI Package利用**: 共通UIコンポーネントは`@mona-ca/ui`から利用し、再利用性を向上させる
- **開発体験の最適化**: StorybookとTestでPresenterを直接操作できるようにする

### 設計目標

- Feature-Sliced Design（FSD）と Presenter/Container（P/C）パターンを**矛盾なく併用**する
- Storybook/Testでは Presenterを直接触れて開発体験を良くする
- 利用者がコンポーネントの実装を知らなくてもそのコンポーネントを使用することが可能にする

## 技術スタック

| カテゴリ | 技術 | 用途 |
|---------|------|------|
| Runtime | Bun | JavaScript/TypeScriptランタイム |
| Framework | React Native + Expo | モバイルアプリフレームワーク |
| UI Library | @mona-ca/ui | 共通UIコンポーネント |
| Styling | NativeWind (TailwindCSS) | スタイリングソリューション |
| Navigation | Expo Router | ファイルベースルーティング |
| State Management | React Hooks | ローカル・グローバル状態管理 |
| Data Fetching | @mona-ca/eden-fetch | 型安全なAPIクライアント |
| Testing | Jest + React Native Testing Library | テストフレームワーク |
| Linter/Formatter | Biome | コード品質管理 |

## Feature-Sliced Design (FSD)

### レイヤー構造

FSDでは、アプリケーションを以下のレイヤーに分割する。

```text
┌─────────────────────────────────────┐
│            App Layer                │  app/ (framework routing)
├─────────────────────────────────────┤
│           Pages Layer               │  layers/pages/
├─────────────────────────────────────┤
│          Widgets Layer              │  layers/widgets/
├─────────────────────────────────────┤
│         Features Layer              │  layers/features/
├─────────────────────────────────────┤
│         Entities Layer              │  layers/entities/
├─────────────────────────────────────┤
│          Shared Layer               │  layers/shared/
└─────────────────────────────────────┘
```

### 各レイヤーの責務

#### 1. App Layer (`app/`)

- フレームワーク固有のルーティング（Expo Router）
- アプリケーションの初期化
- グローバルプロバイダー設定

**ルール**:

- FSDの`app`レイヤーとExpo Routerの`app`ディレクトリが競合するため、FSD実装は`layers/`配下に配置
- ルーティングファイル（`_layout.tsx`, `index.tsx`等）のみを含む

#### 2. Pages Layer (`layers/pages/`)

- ページ全体の構成
- 複数のWidgetの組み合わせ
- ページ固有のレイアウト

**ルール**:

- 基本的にContainerを公開
- ページはルーティングと紐付く単位
- ビジネスロジックは含まず、Widgets/Featuresを組み合わせるのみ

#### 3. Widgets Layer (`layers/widgets/`)

- 大きなUIブロック（ヘッダー、サイドバー、カード等）
- 複数のFeaturesやEntitiesを組み合わせ
- 特定のビジネスコンテキストを持つ

**ルール**:

- 基本的にContainerを公開
- PresenterはStorybook/Test用に開発時用オブジェクトから参照
- 他のWidgetには依存しない

#### 4. Features Layer (`layers/features/`)

- ユーザーアクション（ログイン、いいね、コメント投稿等）
- ビジネスロジックを含む
- 副作用（API呼び出し、ナビゲーション等）を持つ

**ルール**:

- 基本的にContainerを公開
- PresenterはStorybook/Test用に開発時用オブジェクトから参照
- 他のFeatureには依存しない

#### 5. Entities Layer (`layers/entities/`)

- ビジネスエンティティのUI表現（ユーザーカード、商品カード等）
- エンティティ固有のロジック
- 副作用を持たない

**ルール**:

- **Presenterのみ公開**（Containerは置かない）
- 純粋なUIコンポーネント
- API呼び出しやナビゲーションを含まない

#### 6. Shared Layer (`layers/shared/`)

- プロジェクト全体で使用する共通リソース
- UIコンポーネント、ユーティリティ、API、型定義等

**Segments**:

- `shared/ui/` - **`@mona-ca/ui`パッケージから再エクスポート**
- `shared/api/` - APIクライアント、型定義
- `shared/lib/` - ユーティリティ関数
- `shared/config/` - 定数、環境変数
- `shared/types/` - 共通型定義

**ルール**:

- **`shared/ui/`**: 基本的に`@mona-ca/ui`パッケージのコンポーネントを再エクスポート
- **Presenterのみ公開**（Containerは置かない）
- ビジネスロジックを含まない

## ディレクトリ構成

### 全体構成

```text
apps/mobile/
├── src/
│   ├── app/                      # フレームワークディレクトリ（Expo Router）
│   │   ├── _layout.tsx           # ルートレイアウト
│   │   ├── index.tsx             # ホーム画面
│   │   └── ...                   # その他のルート
│   │
│   └── layers/                   # FSDディレクトリ
│       ├── app/                  # アプリ初期化層
│       │   ├── providers/        # グローバルプロバイダー
│       │   └── config/           # アプリ設定
│       │
│       ├── pages/                # ページ層
│       │   └── [page-name]/      # 各ページ
│       │       ├── ui/
│       │       ├── model/
│       │       └── index.ts
│       │
│       ├── widgets/              # ウィジェット層
│       │   └── [widget-name]/    # 各ウィジェット
│       │       ├── ui/
│       │       ├── model/
│       │       ├── lib/
│       │       └── index.ts
│       │
│       ├── features/             # フィーチャー層
│       │   └── [feature-name]/   # 各フィーチャー
│       │       ├── ui/
│       │       ├── model/
│       │       ├── api/
│       │       ├── lib/
│       │       └── index.ts
│       │
│       ├── entities/             # エンティティ層
│       │   └── [entity-name]/    # 各エンティティ
│       │       ├── ui/
│       │       ├── model/
│       │       └── index.ts
│       │
│       └── shared/               # 共有層
│           ├── ui/               # UIコンポーネント（@mona-ca/ui再エクスポート）
│           │   └── index.ts
│           ├── api/              # APIクライアント
│           │   └── index.ts
│           ├── lib/              # ユーティリティ
│           ├── config/           # 設定・定数
│           └── types/            # 型定義
│
├── assets/                       # 静的アセット
├── types/                        # グローバル型定義
├── package.json
├── tsconfig.json
└── app.json                      # Expo設定
```

### Slice構造の詳細

Sliceは`pages/`, `widgets/`, `features/`, `entities/`配下の各モジュール。

```text
[layer]/[slice-name]/
├── ui/                           # UIコンポーネント
│   ├── [component].tsx           # Container（公開用）
│   ├── [component].ui.tsx        # Presenter
│   ├── [component].dev.ts        # 開発時用オブジェクト
│   └── [component].stories.tsx   # Storybook
├── model/                        # 状態管理・ビジネスロジック
│   ├── hooks/                    # カスタムフック
│   ├── types.ts                  # 型定義
│   └── utils.ts                  # ユーティリティ
├── api/                          # API通信（features/pages/widgetsのみ）
│   └── [api-name].ts
├── lib/                          # スライス固有のヘルパー
└── index.ts                      # スライス公開API
```

### Shared Layer詳細

#### `shared/ui/` - UIパッケージの再エクスポート

```text
shared/ui/
└── index.ts                      # @mona-ca/uiの再エクスポート
```

```typescript
// shared/ui/index.ts
export * from "@mona-ca/ui";

// モバイル固有の拡張があればここに追加
export * from "./mobile-specific-component";
```

#### その他のShared Segments

```text
shared/
├── api/
│   ├── client.ts                 # APIクライアント設定
│   └── index.ts
├── lib/
│   ├── date/
│   ├── string/
│   └── validation/
├── config/
│   ├── constants.ts
│   └── env.ts
└── types/
    └── common.ts
```

## レイヤー間の依存関係

### 依存関係の方向

```text
app → pages → widgets → features → entities → shared
```

**重要な原則**:

- **上位レイヤーは下位レイヤーのみに依存**
- **下位レイヤーは上位レイヤーに依存してはいけない**
- **同一レイヤー内のSlice間は依存してはいけない**（特に`features/`と`entities/`）

### 依存関係の具体例

| From | To | 可否 |
|------|----|----|
| pages | widgets, features, entities, shared | ✅ |
| widgets | features, entities, shared | ✅ |
| widgets | widgets | ❌ |
| features | entities, shared | ✅ |
| features | features | ❌ |
| entities | shared | ✅ |
| entities | entities | ❌ |
| shared | shared | ✅（同一セグメント内のみ） |

### UIパッケージの依存関係

```text
@mona-ca/ui (外部パッケージ)
    ↑
shared/ui (再エクスポート)
    ↑
entities/features/widgets/pages (利用)
```

**ルール**:

- `@mona-ca/ui`はmonorepoの`packages/ui`で管理される共通UIパッケージ
- モバイルアプリは`shared/ui`を通じて`@mona-ca/ui`を利用
- 直接`@mona-ca/ui`をimportせず、必ず`shared/ui`経由でimport

## 公開API設計

### Public API (`index.ts`)

FSDでは、各Slice/Segmentが`index.ts`を通じて公開APIを定義する。

**原則**:

- `layers/`配下では**default exportは禁止**、全て**named export**で公開
- 名前空間がぐちゃぐちゃにならないように整理する

### エントリーポイントの場所

#### `shared/ui` と `shared/lib`

- 各モジュール直下に`index.ts`を置く
- 例: `shared/ui/index.ts`

#### `shared/ui` と `shared/lib` 以外のスライスを持たないレイヤー (`shared`, `app`)

- 各セグメント (`ui`, `model`, `lib`) 直下に`index.ts`を置く
- 例: `shared/api/index.ts`

#### スライスを持つレイヤー (`entities/*`, `features/*`, `widgets/*`, `pages/*`)

- **スライス直下**にだけ`index.ts`を置く
- `ui/`, `model/`, `lib/`などのセグメント直下に追加の`index.ts`は作らない
- 例: `features/auth/index.ts`

### 公開APIの例

```typescript
// features/auth/index.ts

// Container（メイン公開API）
export { LoginForm } from "./ui/login-form";
export { SignupForm } from "./ui/signup-form";

// Hooks
export { useAuth } from "./model/hooks/use-auth";

// Types
export type { AuthState, LoginInput } from "./model/types";

// 開発時用オブジェクト（Storybook/Test用）
export { __DEV_LoginForm } from "./ui/login-form.dev";
```

### Import規約

```typescript
// ✅ 正しいimport（Public API経由）
import { Button } from "@/layers/shared/ui";
import { LoginForm } from "@/layers/features/auth";

// ❌ 間違ったimport（内部実装への直接アクセス）
import { Button } from "@/layers/shared/ui/button/button";
import { LoginForm } from "@/layers/features/auth/ui/login-form";

// ❌ 間違ったimport（@mona-ca/uiへの直接アクセス）
import { Button } from "@mona-ca/ui";
```
