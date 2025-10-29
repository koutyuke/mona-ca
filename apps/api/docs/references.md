# 参考資料

mona-ca Backend APIに関する補足情報と参考リソース。

> 📖 **関連ドキュメント**
>
> - [README](./README.md) - ドキュメント目次
> - [アーキテクチャ設計](./architecture.md) - アーキテクチャパターンとディレクトリ構成
> - [実装ガイド](./guides.md) - 実装規約とテスト戦略

## 目次

- [参考資料](#参考資料)
  - [目次](#目次)
  - [補足情報](#補足情報)
    - [Feature公開API](#feature公開api)
    - [コード生成の考慮](#コード生成の考慮)
  - [参考リソース](#参考リソース)
    - [アーキテクチャ](#アーキテクチャ)
    - [フレームワーク・ライブラリ](#フレームワークライブラリ)
    - [認証・セキュリティ](#認証セキュリティ)
    - [その他](#その他)

## 補足情報

### Feature公開API

各featureは `index.ts` で必要なものだけをエクスポート。

```typescript
// features/[feature]/index.ts
// DIContainer
export * from "./di";

// Presenters
export * from "./adapters/presenters/[entity].presenter";

// 必要に応じてDomain Entityもエクスポート
export type { [Entity] } from "./domain/entities/[entity]";
```

### コード生成の考慮

将来的にコード生成を導入する場合、以下のような一貫性が重要:

- ディレクトリ構造の規則性
- 命名規則の統一
- ファイル配置パターンの統一

## 参考リソース

### アーキテクチャ

- [Clean Architecture (Robert C. Martin)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) - Clean Architectureの原則と実装パターン

### フレームワーク・ライブラリ

- [ElysiaJS Documentation](https://elysiajs.com) - ElysiaJS公式ドキュメント
- [Drizzle ORM Documentation](https://orm.drizzle.team) - Drizzle ORM公式ドキュメント
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/) - Cloudflare Workers公式ドキュメント
- [Vitest Documentation](https://vitest.dev) - Vitest公式ドキュメント

### 認証・セキュリティ

- [Lucia Documentation](https://lucia-auth.com) - Lucia認証ライブラリのドキュメント
- [Oslo Documentation](https://oslo.js.org) - Oslo認証ユーティリティのドキュメント
- [Arctic Documentation](https://arctic.js.org) - Arctic OAuth 2.0クライアントのドキュメント

### その他

- [Bun Documentation](https://bun.sh/docs) - Bunランタイムの公式ドキュメント
- [Biome Documentation](https://biomejs.dev) - Biomeリンター/フォーマッターのドキュメント
