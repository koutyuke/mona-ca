# 参考資料

mona-ca Mobile Frontendに関する補足情報と参考リソース。

> 📖 **関連ドキュメント**
>
> - [README](./README.md) - ドキュメント目次
> - [アーキテクチャ設計](./architecture.md) - FSDとディレクトリ構成
> - [実装ガイド](./guides.md) - 実装規約とテスト戦略

## 目次

- [参考資料](#参考資料)
  - [目次](#目次)
  - [補足情報](#補足情報)
    - [FSD Public APIの考慮事項](#fsd-public-apiの考慮事項)
    - [UIパッケージの設計思想](#uiパッケージの設計思想)
    - [Presenter/Container分離の判断基準](#presentercontainer分離の判断基準)
    - [コード生成の考慮](#コード生成の考慮)
  - [参考リソース](#参考リソース)
    - [Feature-Sliced Design](#feature-sliced-design)
    - [React Native / Expo](#react-native--expo)
    - [デザインパターン](#デザインパターン)
    - [スタイリング](#スタイリング)
    - [テスティング](#テスティング)
    - [開発ツール](#開発ツール)
    - [アクセシビリティ](#アクセシビリティ)
    - [その他](#その他)

## 補足情報

### FSD Public APIの考慮事項

各Slice/Segmentは`index.ts`で公開APIを定義し、以下のルールに従う:

- **default exportは禁止**: 全てnamed exportで公開
- **実装の詳細を隠蔽**: 内部構造を外部に露出しない
- **型もエクスポート**: コンポーネントだけでなく、関連する型もエクスポート

### UIパッケージの設計思想

`@mona-ca/ui`は以下の思想で設計されている:

- **プラットフォーム非依存**: Web/Mobile両方で使用可能
- **コンポジション優先**: 小さなコンポーネントを組み合わせて使う
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **型安全**: TypeScriptで完全に型付け

### Presenter/Container分離の判断基準

以下の場合はPresenter/Container分離を検討する:

- ✅ **分離すべき**: API呼び出し、ナビゲーション、グローバル状態管理を含む
- ✅ **分離すべき**: 複雑なビジネスロジックを持つ
- ✅ **分離すべき**: Storybookでインタラクティブに動作を確認したい
- ❌ **分離不要**: 単純な表示のみのコンポーネント
- ❌ **分離不要**: ローカル状態（開閉、選択等）のみを持つ

### コード生成の考慮

将来的にコード生成を導入する場合、以下の一貫性が重要:

- ディレクトリ構造の規則性
- 命名規則の統一
- ファイル配置パターンの統一
- 開発時用オブジェクトの構造統一

## 参考リソース

### Feature-Sliced Design

- [Feature-Sliced Design 公式ドキュメント](https://feature-sliced.design/) - FSD公式ドキュメント
- [FSD - Layers](https://feature-sliced.design/docs/reference/layers) - レイヤーの詳細
- [FSD - Public API](https://feature-sliced.design/docs/reference/public-api) - 公開APIの設計
- [FSD - Isolation](https://feature-sliced.design/docs/reference/isolation) - 分離と依存関係のルール
- [FSD - Examples](https://feature-sliced.design/examples) - 実装例集

### React Native / Expo

- [React Native Documentation](https://reactnative.dev/docs/getting-started) - React Native公式ドキュメント
- [Expo Documentation](https://docs.expo.dev/) - Expo公式ドキュメント
- [Expo Router](https://docs.expo.dev/router/introduction/) - ファイルベースルーティング
- [React Native Performance](https://reactnative.dev/docs/performance) - パフォーマンス最適化

### デザインパターン

- [Presentational and Container Components (Dan Abramov)](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0) - Presenter/Containerパターンの元記事
- [React Component Patterns](https://www.patterns.dev/react/) - Reactのコンポーネントパターン集
- [Composition vs Inheritance (React Docs)](https://react.dev/learn/thinking-in-react) - Compositionの考え方
- [Inversion of Control in React](https://kentcdodds.com/blog/inversion-of-control) - 制御の反転パターン

### スタイリング

- [NativeWind Documentation](https://www.nativewind.dev/) - NativeWind公式ドキュメント
- [TailwindCSS Documentation](https://tailwindcss.com/docs) - TailwindCSS公式ドキュメント
- [React Native Styling Cheat Sheet](https://github.com/vhpoet/react-native-styling-cheat-sheet) - スタイリングチートシート

### テスティング

- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) - React Native Testing Library公式ドキュメント
- [Jest Documentation](https://jestjs.io/docs/getting-started) - Jest公式ドキュメント
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) - テストのベストプラクティス
- [Detox Documentation](https://wix.github.io/Detox/) - E2Eテストフレームワーク
- [Storybook for React Native](https://storybook.js.org/docs/get-started/frameworks/react-native) - Storybook公式ドキュメント

### 開発ツール

- [Bun Documentation](https://bun.sh/docs) - Bunランタイムの公式ドキュメント
- [Biome Documentation](https://biomejs.dev) - Biomeリンター/フォーマッターのドキュメント
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - TypeScript公式ドキュメント
- [React DevTools](https://react.dev/learn/react-developer-tools) - React開発ツール

### アクセシビリティ

- [React Native Accessibility](https://reactnative.dev/docs/accessibility) - React Nativeのアクセシビリティガイド
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - アクセシビリティガイドライン
- [Accessible Components in React Native](https://www.deque.com/blog/accessible-react-native-apps/) - アクセシブルなコンポーネント設計

### その他

- [Monorepo Best Practices](https://monorepo.tools/) - Monorepo設計のベストプラクティス
- [Package Design in Monorepo](https://turborepo.org/docs/handbook/sharing-code) - パッケージ設計
- [API Client Design](https://tanstack.com/query/latest) - APIクライアントの設計（参考）
