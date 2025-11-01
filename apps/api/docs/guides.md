# 実装ガイド

mona-ca Backend APIの実装規約、テスト戦略、命名規則を説明する。

> 📖 **関連ドキュメント**
>
> - [README](./README.md) - ドキュメント目次
> - [アーキテクチャ設計](./architecture.md) - アーキテクチャパターンとディレクトリ構成
> - [参考資料](./references.md) - 補足情報と参考リソース

## 目次

- [実装規約](#実装規約)
  - [Dependency Injection](#dependency-injection)
  - [Repository Pattern](#repository-pattern)
  - [UseCase Pattern](#usecase-pattern)
  - [Presenter Pattern](#presenter-pattern)
  - [Route定義](#route定義)
  - [エラーハンドリング](#エラーハンドリング)
- [テスト戦略](#テスト戦略)
- [命名規則](#命名規則)

## 実装規約

### Dependency Injection

#### Core DIContainer

全Feature共通のインフラを管理。

```typescript
// core/di/container.ts
export class CoreDIContainer {
  private _drizzleService: DrizzleService | undefined;
  private _passwordHasher: IPasswordHasher | undefined;
  // ... 他のサービス

  constructor(
    envVariables: EnvVariables,
    cloudflareBindings: CloudflareBindings,
    override?: Partial<ICoreDIContainer>
  ) {
    // オーバーライドによるテスト対応
  }

  get drizzleService(): DrizzleService {
    if (!this._drizzleService) {
      this._drizzleService = new DrizzleService(this.cloudflareBindings.DB);
    }
    return this._drizzleService;
  }
  // ... 他のgetters（Lazy Initialization）
}
```

#### Feature DIContainer

Feature固有の依存関係を管理。

```typescript
// features/[feature]/di/container.ts
export class [Feature]DIContainer {
  // Repositories
  private _[entity]Repository: I[Entity]Repository | undefined;
  // Use Cases
  private _[action]UseCase: I[Action]UseCase | undefined;

  constructor(
    private readonly coreDI: ICoreDIContainer,
    override?: Partial<I[Feature]DIContainer>
  ) {}

  get [entity]Repository(): I[Entity]Repository {
    if (!this._[entity]Repository) {
      this._[entity]Repository = new [Entity]Repository(
        this.coreDI.drizzleService
      );
    }
    return this._[entity]Repository;
  }

  get [action]UseCase(): I[Action]UseCase {
    if (!this._[action]UseCase) {
      this._[action]UseCase = new [Action]UseCase(
        this.[entity]Repository
      );
    }
    return this._[action]UseCase;
  }
}
```

#### DI Plugin

Elysiaプラグインとして全コンテナを提供。

```typescript
// plugins/di/di.plugin.ts
export const di = () => {
  return new Elysia()
    .derive(({ env }) => {
      const coreDI = new CoreDIContainer(env.variables, env.bindings);
      return {
        containers: {
          core: coreDI,
          auth: new AuthDIContainer(coreDI),
          user: new UserDIContainer(coreDI),
        }
      };
    });
};
```

### Repository Pattern

#### Repositoryのインターフェース定義

```typescript
// features/[feature]/application/ports/repositories/[entity].repository.interface.ts
export interface I[Entity]Repository {
  findById(id: [Entity]Id): Promise<[Entity] | null>;
  save(entity: [Entity]): Promise<void>;
  delete(id: [Entity]Id): Promise<void>;
}
```

#### Repositoryの実装

```typescript
// features/[feature]/adapters/repositories/[entity]/[entity].repository.ts
export class [Entity]Repository implements I[Entity]Repository {
  constructor(private readonly drizzle: DrizzleService) {}

  async findById(id: [Entity]Id): Promise<[Entity] | null> {
    const row = await this.drizzle.db
      .select()
      .from([entity]Table)
      .where(eq([entity]Table.id, id))
      .get();

    if (!row) return null;

    return this.toDomain(row);
  }

  async save(entity: [Entity]): Promise<void> {
    await this.drizzle.db
      .insert([entity]Table)
      .values(this.toPersistence(entity))
      .onConflictDoUpdate({
        target: [entity]Table.id,
        set: this.toPersistence(entity),
      });
  }

  private toDomain(row: [Entity]Table): [Entity] {
    // DBレコード → ドメインエンティティ変換
  }

  private toPersistence(entity: [Entity]): typeof [entity]Table.$inferInsert {
    // ドメインエンティティ → DBレコード変換
  }
}
```

### UseCase Pattern

#### UseCaseのインターフェース定義

```typescript
// features/[feature]/application/contracts/[domain]/[action].usecase.interface.ts
export type [Action]UseCaseResult = Result<Ok, Err>

export interface I[Action]UseCase {
  execute(input: [Input]): Promise<[Action]UseCaseResult>;
}
```

#### UseCaseの実装

```typescript
// features/[feature]/application/use-cases/[domain]/[action].usecase.ts
export class [Action]UseCase implements I[Action]UseCase {
  constructor(
    private readonly [entity]Repository: I[Entity]Repository
  ) {}

  async execute(input: [Input]): Promise<[Action]UseCaseResult> {
    // 1. データ取得
    const entity = await this.[entity]Repository.findById(input.id);

    // 2. バリデーション
    if (!entity) {
      return err("[ERROR_CODE]");
    }

    // 3. ビジネスロジック実行
    // ...

    // 4. 永続化
    await this.[entity]Repository.save(entity);

    // 5. 結果返却
    return ok({ [entity]: entity });
  }
}
```

### Presenter Pattern

#### 定義

```typescript
// features/[feature]/adapters/presenters/[entity].presenter.ts
import { type Static, t } from "elysia";

// レスポンススキーマ定義
export const [Entity]ResponseSchema = t.Object({
  id: t.String(),
  name: t.String(),
  createdAt: t.String({ format: "date-time" }),
});

export type [Entity]Response = Static<typeof [Entity]ResponseSchema>;

// Entity → Response変換関数
export const to[Entity]Response = (entity: [Entity]): [Entity]Response => {
  return {
    id: entity.id,
    name: entity.name,
    createdAt: entity.createdAt.toISOString(),
  };
};
```

### Route定義

```typescript
// routes/[resource]/[action].ts
export const [Action][Resource] = new Elysia()
  // Local Middleware & Plugins
  .use(di())
  .use(authPlugin({ requireEmailVerification: true }))

  // Routes
  .[method](
    "[path]",
    async ({ [params], containers, status }) => {
      // 1. UseCaseを実行
      const result = await containers.[feature].[action]UseCase.execute(input);

      // 2. エラーハンドリング
      if (result.isErr) {
        return status("Bad Request", {
          code: result.code,
          message: "[Error message]",
        });
      }

      // 3. Presenterで変換して返却
      return to[Entity]Response(result.value.[entity]);
    },
    {
      // スキーマ定義
      [params]: [Schema],
      // OpenAPI定義
      detail: pathDetail({
        operationId: "[operation-id]",
        summary: "[Summary]",
        description: "[Description]",
        tag: "[Tag]",
        withAuth: true,
      }),
    }
  );
```

### エラーハンドリング

#### Result型

```typescript
import { ok, err, type Result } from "@mona-ca/core/utils";

// 成功時
return ok({ data: someData });

// エラー時
return err("ERROR_CODE");
```

## テスト戦略

### テストの種類

| 種類 | 対象 | ツール | 実行環境 |
|-----|------|--------|---------|
| Unit Test | Repository, UseCase | Vitest | Bun |
| Integration Test | Plugin, Route | Vitest + @cloudflare/vitest-pool-workers | Cloudflare Workers Simulator |

### Repository Test

```typescript
// features/[feature]/adapters/repositories/[entity]/tests/find-by-id.test.ts
import { describe, it, expect, beforeEach } from "vitest";

describe("[Entity]Repository.findById", () => {
  let repository: [Entity]Repository;
  let drizzle: DrizzleService;

  beforeEach(async () => {
    // Setup: テストDB準備
    drizzle = createTestDrizzleService();
    repository = new [Entity]Repository(drizzle);
  });

  it("should return entity when exists", async () => {
    // Arrange
    const fixture = create[Entity]Fixture();
    await insert[Entity]ToTestDB(drizzle, fixture);

    // Act
    const result = await repository.findById(fixture.id);

    // Assert
    expect(result).not.toBeNull();
    expect(result?.id).toBe(fixture.id);
  });

  it("should return null when not exists", async () => {
    // Act
    const result = await repository.findById("non-existent-id");

    // Assert
    expect(result).toBeNull();
  });
});
```

### UseCase Test

```typescript
// features/[feature]/application/use-cases/[domain]/[action].usecase.test.ts
import { describe, it, expect, beforeEach } from "vitest";

describe("[Action]UseCase", () => {
  let useCase: [Action]UseCase;
  let mockRepository: Mock[Entity]Repository;

  beforeEach(() => {
    // Setup: モック作成
    mockRepository = new Mock[Entity]Repository();
    useCase = new [Action]UseCase(mockRepository);
  });

  it("should successfully [action] when valid input", async () => {
    // Arrange
    const input = { id: "test-id" };
    const fixture = create[Entity]Fixture();
    mockRepository.findById.mockResolvedValue(fixture);

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isOk).toBe(true);
    expect(result.value.[entity]).toBe(fixture);
  });

  it("should return error when [entity] not found", async () => {
    // Arrange
    mockRepository.findById.mockResolvedValue(null);

    // Act
    const result = await useCase.execute({ id: "non-existent" });

    // Assert
    expect(result.isErr).toBe(true);
    expect(result.code).toBe("[ERROR_CODE]");
  });
});
```

### Plugin Test

```typescript
// plugins/[plugin]/tests/[test-case].test.ts
import { describe, it, expect } from "vitest";
import { Elysia } from "elysia";

describe("[Plugin]", () => {
  it("should [behavior]", async () => {
    // Arrange
    const app = new Elysia()
      .use([plugin]())
      .get("/test", () => "test");

    // Act
    const response = await app.handle(
      new Request("http://localhost/test")
    );

    // Assert
    expect(response.status).toBe(200);
  });
});
```

### テストヘルパー

#### Fixture

```typescript
// features/[feature]/testing/fixtures/[entity].fixture.ts
export const create[Entity]Fixture = (
  override?: Partial<[Entity]>
): [Entity] => {
  return {
    id: "test-id",
    name: "test-name",
    createdAt: new Date("2025-01-01"),
    ...override,
  };
};
```

#### Mock Repository

```typescript
// features/[feature]/testing/mocks/repositories/[entity].repository.mock.ts
export class Mock[Entity]Repository implements I[Entity]Repository {
  findById = vi.fn<[id: [Entity]Id], Promise<[Entity] | null>>();
  save = vi.fn<[entity: [Entity]], Promise<void>>();
  delete = vi.fn<[id: [Entity]Id], Promise<void>>();
}
```

#### Test DB Helper

```typescript
// core/testing/helpers/[entity]-table.ts
export const insert[Entity]ToTestDB = async (
  drizzle: DrizzleService,
  entity: [Entity]
): Promise<void> => {
  await drizzle.db
    .insert([entity]Table)
    .values({
      id: entity.id,
      name: entity.name,
      // ...
    });
};

export const clear[Entity]FromTestDB = async (
  drizzle: DrizzleService
): Promise<void> => {
  await drizzle.db.delete([entity]Table);
};
```

## 命名規則

### ファイル・ディレクトリ

| 種類 | 規則 | 例 |
|-----|------|-----|
| ディレクトリ | kebab-case | `account-association/` |
| ファイル | kebab-case | `get-profile.usecase.ts` |
| テストファイル | `[name].test.ts` | `find-by-id.test.ts` |
| インターフェースファイル | `[name].interface.ts` | `container.interface.ts` |
| 型定義ファイル | `type.ts` または `[name].d.ts` | `type.ts`, `worker-configuration.d.ts` |

### TypeScript

| 種類 | 規則 | 例 |
|-----|------|-----|
| クラス | PascalCase | `GetProfileUseCase` |
| インターフェース | PascalCase + `I` prefix | `IProfileRepository` |
| 型エイリアス | PascalCase | `ProfileResponse` |
| 変数・関数 | camelCase | `getProfile`, `userId` |
| 定数 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| プライベートフィールド | `_` prefix + camelCase | `_drizzleService` |

### UseCase

| パターン | 命名 |
|---------|------|
| 作成 | `Create[Entity]UseCase` |
| 取得 | `Get[Entity]UseCase` |
| 一覧取得 | `List[Entity]UseCase` |
| 更新 | `Update[Entity]UseCase` |
| 削除 | `Delete[Entity]UseCase` |
| カスタム | `[Action][Entity]UseCase` |

例:

- `CreateProfileUseCase`
- `GetProfileUseCase`
- `UpdateProfileUseCase`
- `LoginUseCase`
- `SignupConfirmUseCase`

### Repository

```text
[Entity]Repository
```

例:

- `ProfileRepository`
- `SessionRepository`
- `ExternalIdentityRepository`

### Presenter

```text
[Entity]Presenter
```

または関数形式:

```text
to[Entity]Response
```

例:

- `ProfilePresenter`
- `toProfileResponse`

### Gateway

```text
[Service]Gateway
```

例:

- `EmailGateway`
- `TurnstileGateway`
- `DiscordGateway` (OAuth Provider)
- `GoogleGateway` (OAuth Provider)

### Route

```text
[Action][Resource]Route
```

例:

- `GetProfileRoute`
- `UpdateProfileRoute`
- `LoginRoute`
- `SignupRequestRoute`

### Plugin

```text
[Plugin]Plugin
```

例:

- `AuthPlugin`
- `RatelimitPlugin`
- `ClientTypePlugin`

### エラーコード

```text
UPPER_SNAKE_CASE
```

例:

- `PROFILE_NOT_FOUND`
- `INVALID_SESSION`
- `EMAIL_ALREADY_EXISTS`
- `UNAUTHORIZED`
