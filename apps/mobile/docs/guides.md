# 実装ガイド

mona-ca Mobile Frontendの実装規約、テスト戦略、命名規則を説明する。

> 📖 **関連ドキュメント**
>
> - [README](./README.md) - ドキュメント目次
> - [アーキテクチャ設計](./architecture.md) - FSDとディレクトリ構成
> - [参考資料](./references.md) - 補足情報と参考リソース

## 目次

- [Presenter/Container Pattern](#presentercontainer-pattern)
- [UIパッケージの使用](#uiパッケージの使用)
- [Composition/Handler](#compositionhandler)
- [Storybook戦略](#storybook戦略)
- [テスト戦略](#テスト戦略)
- [開発時用オブジェクト](#開発時用オブジェクト)
- [命名規則](#命名規則)

## Presenter/Container Pattern

デザインパターンとしてPresenter/Container Patternを採用する。

このデザインパターンはComponentをUI専業のPresenterとロジックや副作用を扱うContainerに分離し、StorybookやTestを記述しやすくするものである。

Containerの注入方法としてCompositionを採用する。ロジックは基本的にhooksとしてまとめる。

### Presenterとは

UI専業の純粋関数なPure Component。依存先は同層・下層のPresenter/UIのみ。

**やっていいこと**:

- Propsの表示
- UI固有の`useState`を持つ（開閉、hover、選択など）
- 同層・下層のPresenter/UIコンポーネントのレンダリング

**やってはダメなこと**:

- データ取得などの副作用（API呼び出し、routing副作用等）
- 参照透過性にならない行為
  - Propsの破壊的メソッドの使用など
- Containerのレンダリング
  - Containerを入れたい場合はCompositionで挿入する

### Containerとは

データ取得、副作用、ヘッドレスの結線、Presenterへの**依存注入**を担当する。基本的にはContainer用のPresenterを描画させるためにある。

**やっていいこと**:

- Presenterにpropsを渡して描画
- 副作用を持つ処理の記述
- アプリケーションロジックを含んだhooksの実行
- 簡易的なUI表示ロジックの実行

**やってはダメなこと**:

- UI関連の記述
  - スタイルの適用
  - 詳細なレイアウト構造の定義

### Presenterの実装例

```tsx
// layers/features/auth/ui/login-form.ui.tsx
import { Button, TextInput } from "@/layers/shared/ui";
import { View, Text } from "react-native";

export type LoginFormUIProps = {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
};

export const LoginFormUI = ({
  email,
  password,
  isLoading,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: LoginFormUIProps) => {
  return (
    <View className="gap-4 p-4">
      <TextInput
        label="メールアドレス"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="パスワード"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
      />
      {error && <Text className="text-red-500">{error}</Text>}
      <Button
        onPress={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? "ログイン中..." : "ログイン"}
      </Button>
    </View>
  );
};
```

### Containerの実装例

```tsx
// layers/features/auth/ui/login-form.tsx
import { LoginFormUI } from "./login-form.ui";
import { useLoginForm } from "../model/hooks/use-login-form";

export type LoginFormProps = {
  onSuccess?: () => void;
};

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const {
    email,
    password,
    isLoading,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
  } = useLoginForm({ onSuccess });

  return (
    <LoginFormUI
      email={email}
      password={password}
      isLoading={isLoading}
      error={error}
      onEmailChange={handleEmailChange}
      onPasswordChange={handlePasswordChange}
      onSubmit={handleSubmit}
    />
  );
};
```

### Presenter/Containerの命名規則

#### Presenter

- **Containerがある場合**: `*.ui.tsx` / `*UI`
  - 例: `login-form.ui.tsx` / `LoginFormUI`
- **Containerがない場合**: `*.tsx` / そのまま
  - 内部実装がPresenterである事実を隠し、`UserAvatar`のような中立名で公開する
  - 例: `user-avatar.tsx` / `UserAvatar`

#### Container

- `*.tsx` / そのまま
  - 例: `login-form.tsx` / `LoginForm`

### PresenterとContainerの関係

|  | **配置してもいいか** | **備考** |
| --- | --- | --- |
| **Presenterの中にPresenter** | ✅ |  |
| **Presenterの中にContainer** | ❌ | Containerを入れたい場合はCompositionで注入 |
| **Containerの中にPresenter** | ✅ |  |
| **Containerの中にContainer** | ✅ | Presenterの引数に入れる時のみ |

### レイヤー別の公開方針

- **Presenterのみ公開**: `shared` / `entities`
  - Containerは置かない
- **基本はContainerを公開**: `features` / `widgets` / `pages`
  - Presenterを公開する時はContainerとして公開する
  - Presenterは Story/Test/組み込み用に**開発時用オブジェクト**から参照

## UIパッケージの使用

### 基礎UIは `/packages/ui`

プロジェクト全体で使用する基本的なUIコンポーネント（Button, TextInput, Card等）は、monorepoの`/packages/ui`（`@mona-ca/ui`）で管理されている。

**原則**:

- モバイルアプリでは`@mona-ca/ui`を**直接importしない**
- 必ず`shared/ui`を経由してimportする
- `shared/ui`は`@mona-ca/ui`を再エクスポートする

### `shared/ui`の実装

```typescript
// layers/shared/ui/index.ts

// @mona-ca/uiの再エクスポート
export * from "@mona-ca/ui";

// モバイル固有の追加コンポーネント（必要に応じて）
export { MobileSpecificComponent } from "./mobile-specific-component";
```

### 使用例

```tsx
// ✅ 正しい使用方法
import { Button, TextInput, Card } from "@/layers/shared/ui";

export const MyComponent = () => {
  return (
    <Card>
      <TextInput label="名前" />
      <Button>送信</Button>
    </Card>
  );
};

// ❌ 間違った使用方法（直接import）
import { Button } from "@mona-ca/ui"; // これはダメ！
```

### UIコンポーネントのカスタマイズ

`@mona-ca/ui`のコンポーネントをモバイル固有にカスタマイズしたい場合:

```tsx
// layers/shared/ui/custom-button.tsx
import { Button, type ButtonProps } from "@mona-ca/ui";

export type CustomButtonProps = ButtonProps & {
  variant?: "primary" | "secondary";
};

export const CustomButton = ({ variant = "primary", ...props }: CustomButtonProps) => {
  return (
    <Button
      className={variant === "primary" ? "bg-blue-500" : "bg-gray-500"}
      {...props}
    />
  );
};
```

```typescript
// layers/shared/ui/index.ts
export * from "@mona-ca/ui";
export { CustomButton } from "./custom-button";
```

## Composition/Handler

Presenterに対してハンドラやコンポーネントをPropsを通じて渡す。

### 使う基準

- Presenter側が「差し替え可能な部位」や「動作（副作用）を呼ぶ接点（Container Component等）」を持つ場合
- Feature特有のアクションやナビゲーションを**上位レイヤーから注入**したい場合（下位に上位を依存させないため）

### 注入の形

- `actions` - 副作用ハンドラの集合
- `slots` - 差し替え可能な小コンポーネント

### Composition例: actions

```tsx
// Presenter
export type UserCardUIProps = {
  user: User;
  actions?: {
    onFollow?: () => void;
    onMessage?: () => void;
  };
};

export const UserCardUI = ({ user, actions }: UserCardUIProps) => {
  return (
    <Card>
      <Text>{user.name}</Text>
      {actions?.onFollow && (
        <Button onPress={actions.onFollow}>フォロー</Button>
      )}
      {actions?.onMessage && (
        <Button onPress={actions.onMessage}>メッセージ</Button>
      )}
    </Card>
  );
};

// Container
export const UserCard = ({ user }: { user: User }) => {
  const { follow } = useFollowUser();
  const { navigate } = useNavigation();

  return (
    <UserCardUI
      user={user}
      actions={{
        onFollow: () => follow(user.id),
        onMessage: () => navigate("message", { userId: user.id }),
      }}
    />
  );
};
```

### Composition例: slots

```tsx
// Presenter
export type PostCardUIProps = {
  post: Post;
  slots?: {
    header?: React.ReactNode;
    footer?: React.ReactNode;
  };
};

export const PostCardUI = ({ post, slots }: PostCardUIProps) => {
  return (
    <Card>
      {slots?.header}
      <Text>{post.content}</Text>
      {slots?.footer}
    </Card>
  );
};

// Container
export const PostCard = ({ post }: { post: Post }) => {
  return (
    <PostCardUI
      post={post}
      slots={{
        header: <PostAuthorInfo author={post.author} />,
        footer: <PostActions postId={post.id} />,
      }}
    />
  );
};
```

## Storybook戦略

StorybookはPresenterを使用して作成する。

### Storybookファイルの配置

```text
layers/features/auth/ui/
├── login-form.tsx          # Container
├── login-form.ui.tsx       # Presenter
├── login-form.dev.ts       # 開発時用オブジェクト
└── login-form.stories.tsx  # Storybook
```

### Storyの実装例

```tsx
// layers/features/auth/ui/login-form.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-native";
import { LoginFormUI } from "./login-form.ui";
import { __DEV_LoginForm } from "./login-form.dev";

const meta = {
  component: LoginFormUI,
  title: "features/auth/LoginForm",
} satisfies Meta<typeof LoginFormUI>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: __DEV_LoginForm.props(),
};

export const WithError: Story = {
  args: __DEV_LoginForm.props({
    error: "メールアドレスまたはパスワードが間違っています",
  }),
};

export const Loading: Story = {
  args: __DEV_LoginForm.props({
    isLoading: true,
  }),
};
```

### Storybook実行

```bash
bun run storybook
```

## テスト戦略

### テストの種類

| 種類 | 対象 | ツール | 実行内容 |
|-----|------|--------|---------|
| Unit Test | Presenter | Jest + React Native Testing Library | UIロジックの検証 |
| Integration Test | Container | Jest + React Native Testing Library | 統合動作の検証 |
| E2E Test | 画面全体 | Detox / Maestro | ユーザーフローの検証 |

### Presenterのテスト（Unit Test）

```tsx
// layers/features/auth/ui/login-form.ui.test.tsx
import { render, screen, fireEvent } from "@testing-library/react-native";
import { LoginFormUI } from "./login-form.ui";
import { __DEV_LoginForm } from "./login-form.dev";

describe("LoginFormUI", () => {
  it("should render email and password inputs", () => {
    const props = __DEV_LoginForm.props();
    render(<LoginFormUI {...props} />);

    expect(screen.getByLabelText("メールアドレス")).toBeTruthy();
    expect(screen.getByLabelText("パスワード")).toBeTruthy();
  });

  it("should call onEmailChange when email input changes", () => {
    const onEmailChange = jest.fn();
    const props = __DEV_LoginForm.props({ onEmailChange });
    render(<LoginFormUI {...props} />);

    const emailInput = screen.getByLabelText("メールアドレス");
    fireEvent.changeText(emailInput, "test@example.com");

    expect(onEmailChange).toHaveBeenCalledWith("test@example.com");
  });

  it("should display error message when error prop is provided", () => {
    const props = __DEV_LoginForm.props({
      error: "エラーメッセージ",
    });
    render(<LoginFormUI {...props} />);

    expect(screen.getByText("エラーメッセージ")).toBeTruthy();
  });

  it("should disable button when isLoading is true", () => {
    const props = __DEV_LoginForm.props({ isLoading: true });
    render(<LoginFormUI {...props} />);

    const button = screen.getByRole("button");
    expect(button.props.disabled).toBe(true);
  });
});
```

### Containerのテスト（Integration Test）

```tsx
// layers/features/auth/ui/login-form.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { LoginForm } from "./login-form";
import { mockApiClient } from "@/layers/shared/api/__mocks__";

jest.mock("@/layers/shared/api");

describe("LoginForm", () => {
  it("should call login API when form is submitted", async () => {
    const onSuccess = jest.fn();
    mockApiClient.auth.login.mockResolvedValue({ success: true });

    render(<LoginForm onSuccess={onSuccess} />);

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "password123");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockApiClient.auth.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("should display error when login fails", async () => {
    mockApiClient.auth.login.mockRejectedValue(new Error("ログインに失敗しました"));

    render(<LoginForm />);

    const emailInput = screen.getByLabelText("メールアドレス");
    const passwordInput = screen.getByLabelText("パスワード");
    const submitButton = screen.getByRole("button");

    fireEvent.changeText(emailInput, "test@example.com");
    fireEvent.changeText(passwordInput, "wrong-password");
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(screen.getByText("ログインに失敗しました")).toBeTruthy();
    });
  });
});
```

### テスト実行

```bash
# すべてのテストを実行
bun run test

# watchモードで実行
bun run test:watch

# カバレッジを確認
bun run test:coverage
```

## 開発時用オブジェクト

StorybookやTestを作成するときに使用するモックやPresenterなどをまとめて公開するもの。主にContainerに紐づくPresenterを公開したり、StorybookやTestで使用するためのPropsを公開したりする。

### 開発時用オブジェクトの命名規則

開発時用オブジェクトは`__DEV_*`という命名規則を使う。

ファイル名は`*.dev.ts(x)`という命名規則を使う。

### 開発時用オブジェクトの実装例

```typescript
// layers/features/auth/ui/login-form.dev.ts
import type { LoginFormUIProps } from "./login-form.ui";
import { LoginFormUI } from "./login-form.ui";

export const __DEV_LoginForm = {
  // Presenterコンポーネント
  ui: LoginFormUI,

  // デフォルトProps生成関数
  props: (overrides?: Partial<LoginFormUIProps>): LoginFormUIProps => ({
    email: "",
    password: "",
    isLoading: false,
    error: null,
    onEmailChange: () => {},
    onPasswordChange: () => {},
    onSubmit: () => {},
    ...overrides,
  }),

  // よく使うPropsのプリセット
  presets: {
    default: {
      email: "",
      password: "",
      isLoading: false,
      error: null,
    },
    loading: {
      email: "test@example.com",
      password: "password123",
      isLoading: true,
      error: null,
    },
    error: {
      email: "test@example.com",
      password: "password123",
      isLoading: false,
      error: "メールアドレスまたはパスワードが間違っています",
    },
  },
};
```

### 開発時用オブジェクトの公開

```typescript
// layers/features/auth/index.ts

// 通常の公開API
export { LoginForm } from "./ui/login-form";
export { useLoginForm } from "./model/hooks/use-login-form";

// 開発時用オブジェクト
export { __DEV_LoginForm } from "./ui/login-form.dev";
```

### 開発時用オブジェクトの使用例

```tsx
// Storybookでの使用
import { __DEV_LoginForm } from "@/layers/features/auth";

export const Default: Story = {
  args: __DEV_LoginForm.props(),
};

export const WithError: Story = {
  args: __DEV_LoginForm.props(__DEV_LoginForm.presets.error),
};
```

```tsx
// Testでの使用
import { __DEV_LoginForm } from "@/layers/features/auth";

it("should render correctly", () => {
  const props = __DEV_LoginForm.props();
  render(<__DEV_LoginForm.ui {...props} />);
  // ...
});
```

## 命名規則

### ファイル・ディレクトリ

| 種類 | 規則 | 例 |
|-----|------|-----|
| ディレクトリ | kebab-case | `user-profile/`, `auth/` |
| ファイル | kebab-case | `login-form.tsx`, `use-auth.ts` |
| Presenterファイル | `[name].ui.tsx` | `login-form.ui.tsx` |
| Containerファイル | `[name].tsx` | `login-form.tsx` |
| 開発時用オブジェクト | `[name].dev.ts(x)` | `login-form.dev.ts` |
| Storybookファイル | `[name].stories.tsx` | `login-form.stories.tsx` |
| テストファイル | `[name].test.tsx` | `login-form.test.tsx` |
| Hooksファイル | `use-[name].ts` | `use-auth.ts`, `use-form.ts` |

### TypeScript

| 種類 | 規則 | 例 |
|-----|------|-----|
| コンポーネント | PascalCase | `LoginForm`, `UserAvatar` |
| Presenterコンポーネント | PascalCase + `UI` suffix | `LoginFormUI`, `UserAvatarUI` |
| Props型 | PascalCase + `Props` suffix | `LoginFormProps`, `LoginFormUIProps` |
| Hooks | `use` prefix + camelCase | `useAuth`, `useLoginForm` |
| 変数・関数 | camelCase | `handleSubmit`, `userId` |
| 定数 | UPPER_SNAKE_CASE | `MAX_LENGTH`, `API_ENDPOINT` |
| 型エイリアス | PascalCase | `User`, `AuthState` |
| 開発時用オブジェクト | `__DEV_` prefix + PascalCase | `__DEV_LoginForm` |

### レイヤー・スライス

| 種類 | 規則 | 例 |
|-----|------|-----|
| Layerディレクトリ | 小文字 | `pages/`, `features/`, `entities/` |
| Sliceディレクトリ | kebab-case | `user-profile/`, `auth/` |
| Segmentディレクトリ | 小文字 | `ui/`, `model/`, `api/`, `lib/` |

### コンポーネント命名パターン

| パターン | 命名 | 例 |
|---------|------|-----|
| Form系 | `[Name]Form` | `LoginForm`, `SignupForm` |
| Card系 | `[Name]Card` | `UserCard`, `PostCard` |
| List系 | `[Name]List` | `UserList`, `PostList` |
| Item系 | `[Name]Item` | `UserItem`, `PostItem` |
| Header系 | `[Name]Header` | `PageHeader`, `SectionHeader` |
| Modal系 | `[Name]Modal` | `ConfirmModal`, `ShareModal` |
| Button系 | `[Name]Button` | `FollowButton`, `LikeButton` |
