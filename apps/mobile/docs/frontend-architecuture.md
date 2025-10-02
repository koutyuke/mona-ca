フロントエンド(Mobile, Web)でのルールである。

基本的に全体共通のルールを記載しているがドメイン固有のルールが存在する。その場合はルールの先頭に絵文字を記載すること。

🌐 - Web領域

📱 - Mobile領域

🎨 - UI Package領域

# 目的

---

- Feature-Sliced Design（以下FSD）と Presenter/Container（以下P/C）パターンを**矛盾なく併用**するためのルールを定義する
- Storybook / Test では Presenter を直接触れて開発体験を良くする
- 利用者がコンポーネントの実装を知らなくてもそのコンポーネントを使用することが可能にする

# レイヤー方針（FSD）

---

このアプリケーションではアーキテクチャとしてFeature-Sliced Design(FSD)を採用する。

それにあたり、FSDにはLayer, Slice, Segmentが存在している。詳しくは公式ドキュメントへ。

**FSD公式ドキュメント**

[Welcome | Feature-Sliced Design](https://feature-sliced.design/)

## ディレクトリ構成

---

[Layers | Feature-Sliced Design](https://feature-sliced.design/docs/reference/layers)

```
./src/
├── app             // framework dir
└── layers          // FSD dir
    ├── app
    ├── entities
    ├── features
    ├── pages
    ├── shared
    └── widgets
```

FSDの実装はをそのまま `src` 配下においてしまうとルーティングで使用する`app`とFSDの`app`が競合してしまう。そのためFSDの実装を `layers` ディレクトリ配下に、フレームワーク固有のルーティングなどは `app` 配下に実装する。

## 公開ポリシー

---

[Public API | Feature-Sliced Design](https://feature-sliced.design/docs/reference/public-api)

実装したものを公開したい場合、Public APIとして `index.ts` で再exportするように設計する。

また、名前空間がぐちゃぐちゃにならないようするため `layers` 配下ではdefault exportは禁止し全てnamed export で公開する。

### エントリーポイントの場所

---

`shared/ui` と `shared/lib`

- 各モジュール直下 に `index.ts` を置く
- 例: `shared/ui/button/index.ts`

`shared/ui` と `shared/lib` 以外のスライスを持たないレイヤー(`shared` ,`app` )

- 各セグメント(`ui`, `model`, `lib` )直下に `index.ts` を置く
- 例: `shared/api/index.ts`

スライスを持つレイヤー(`entities/*`, `features/*`, `widgets/*`, `pages/*` )

- **スライス直下** にだけ `index.ts` を置く
- `ui/`, `model/`, `lib/` などのセグメント直下に追加の `index.ts` は作らない
- 例: `features/auth/index.ts`

## 依存の方向

---

上位→下位へ一方向になるようにすること

下位（entities）が上位（features等）に依存するのは不可。

<aside>
🏢

**レイヤー一覧**

1. app
2. pages
3. widgets
4. features
5. entities
6. shared
</aside>

# Presenter / Container Pattern

---

デザインパターンとしてPresenter / Container Patternを採用する。

このデザインパターンはComponentをUI専業のPresenterとロジックや副作用を扱うContainerに分離しStorybookやTestを記述しやすくするものである。

また、Containerの注入方法としてCompositionを採用する。

ロジックは基本的にhooksとしてまとめる。

## **Presenter と Container について**

---

### Presenter

---

UI専業。純粋関数なPure Componentである。依存先は同層・下層のPresenter/UIのみ。

**やっていいこと**

- Propsの表示
- UI固有の `useState` は持ってよい（開閉、hover、選択など）。

**やってはダメなこと**

- データ取得などの副作用（API呼び出し、routing副作用等）。
- 参照透過性にならない行為
    - Propsの破壊的メソッドの使用など
- Containerをレンダーのレンダリング。
    - Containerを入れたい場合はCompositionで挿入する。

### **Container**

---

データ取得、副作用、ヘッドレスの結線、Presenterへの**依存注入**を担当。基本的にはContainer ようのPresenterを描画させるためにある。

**やっていいこと**

- Presenter に props を渡して描画
- 副作用を持つ処理の記述
- アプリケーションロジックを含んだhooksの実行
- 簡易的なUI表示ロジックの実行

**やってはダメなこと**

- UI関連の記述
    - スタイルの適応

### 命名規則

---

**Presenter**

- Containerコンポーネントがある場合: `*.ui.tsx` / `*UI`
    - 例: `foo.ui.tsx` / `FooUI`
- Containerコンポーネントがない場合: `*.tsx` / そのまま
    - 内部実装が Presenter である事実を隠し、`UserAvatar` のような中立名で公開する。
    - 例: `foo.tsx` / `Foo`

**Container**

- `*.tsx` / そのまま
    - 例: `foo.tsx` / `Foo`

### PresenterとContainerの関係

---

|  | **配置してもいいか** | **備考** |
| --- | --- | --- |
| **Presenterの中にPresenter** | ✅ |  |
| **Presenterの中にContainer** | ❌ | Containerを入れたい場合はCompositionで注入 |
| **Containerの中にPresenter** | ✅ |  |
| **Containerの中にContainer** | ✅ | Presenterの引数に入れる時のみ |

### レイヤー別の公開方針

---

- **Presenter のみ公開:** `Shared` / `Entity`
  - Container は置かない
- **基本は Container を公開:** `features` / `widgets` / `pages`
  - Presenter を公開する時はContainerとして公開する
  - Presenter は Story/Test/組み込み用に**開発時用オブジェクト**から参照

## Composition / Handler

---

Presenterに対してハンドラやコンポーネントをPropsを通じて渡す

**使う基準**

- Presenter 側が「差し替え可能な部位」や「動作（副作用）を呼ぶ接点 (= Container Componentなど)」を持つ場合。
- Feature 特有のアクションやナビゲーションを **上位レイヤーから注入**したい場合（下位に上位を依存させないため）。

**注入の形**

- `actions`（副作用ハンドラの集合）
- `slots`（差し替え可能な小コンポーネント）

## Storybook / Test

---

主にUnit TestはPresenterを用いて記述し、Integration TestはContainerを用いて行う。

StorybookはPresenterで作成する。

Storybook/Test でのPresenterやモック作成等は**開発時用のオブジェクトのみ**を使う

|  | やること |
| --- | --- |
| **Presenter** | `Unit Test` `Storybook` |
| **Container** | `Integration Test` `E2E Test` |

### 開発時用オブジェクト

---

StorybookやTestを作成するときに使用するモックやPresenterなどをまとめて公開するもの
主にContainerに紐づくPresenterを公開したり、StorybookやTestで使用するためのPropsを公開したりする。

**命名規則**

開発時用オブジェクトは `__DEV_*` という命名規則を使う。
- `__DEV_*`

ファイル名は `*.dev.ts(x)` という命名規則を使う。

```jsx
const __DEV_Foo = {
	ui: ...,             // UI Component
	props: (over) => {
		foo: ...,
		var: ...,
		baz: ...,
		...over
	},
	...
}
```
