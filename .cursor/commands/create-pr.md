# Create Pull Request

## 概要

現在のブランチブランチから特定のブランチへのPull Requestを作成する。

## 前提知識

- branchは`{Issue Number}-{Task Type}/{Branch Name}`の形式である。
  - 例: `1-feat/implement-mobile-signup-screen`
  - Task Typeは以下のいずれかである。
    - `feat`: 新機能の追加
    - `fix`: 既存機能の修正
    - `refactor`: 構造改善・リファクタリング
    - `docs`: ドキュメントの作成・更新
    - `test`: テストの追加・修正
    - `chore`: 雑務・メンテ作業
    - `style`: スタイル調整
    - `perf`: パフォーマンス改善
    - `build`: ビルドや依存関係の更新

## ルール

- 日本語での回答・作成を基本とする
- 文体は常体で回答・作成すること

## 手順

1. **ブランチの前準備**

   - すべての変更がコミットされていることを確認
     - されていない場合はユーザーに確認する
   - ブランチをリモートにプッシュ

2. **変更点を作成する**

   - 現在のブランチのとMerge先のブラントの変更点を確認する
   - これらの変更を確認するコマンドを使用してその内容を確認すること
     - `git diff --stat origin/{対象のブランチ}..HEAD`
     - `git log --oneline origin/{対象のブランチ}..HEAD`

3. **Titleを作成する**

   - PRのタイトルは基本的にブランチ名を詳しくかつ内容を簡潔にしたものにする。
   - Titleの形式は `{Task Type}({Issue Number})/ {Title}` であり、この形式で作成すること。
   - ブランチ名はある程度短くするようにしているためある程度詳細になるようにTitleを作成すること。
   - 例(ブランチ名: `1-feat/ implement-mobile-signup-screen`): `feat(1)/ Implement mobile signup screen`

4. **Discriptionを作成する**
   - テンプレートは`.github/pull_request_template.md`を利用すること
   - 確認した変更点を元に作成すること
   - 破壊的変更があれば記載
   - 関連するissueをリンクする
     - 表記方法は`- closed #{Issue Number}`とする

5. **PRの設定**
   - 作成したtitleと説明文を元にPRを作成する
