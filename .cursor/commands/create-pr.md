# Create Pull Request

## 概要

現在のブランチブランチから特定のブランチへのPull Requestを作成する。

## 前提知識

- branchは`{Backlog ID}/{branch name}`の形式である。
  - 例: `MC-1/implement-mobile-signup-screen`

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

3. **関連するIssueを見つける**

   - 関連するIssueを見つけ、Issue IDを取得する
   - Issueは基本的に`[<Backlog ID>] <Issueのタイトル>`の形式である。
     - 例: `[MC-1] Implement mobile signup screen`
   - ブランチにあるBacklog IDを元にIssueを見つける
   - ブランチの検索には `gh issue list` を使用する
   - あった場合はそのIssue IDを確認する
   - ない場合はユーザーに確認する

4. **Titleを作成する**

   - PRのタイトルは基本的にブランチ名を詳しくかつ内容を簡潔にしたものにする。
   - Titleの形式は `[<Backlog ID>] <PRのタイトル>` であり、この形式で作成すること。
   - 例(ブランチ名: `MC-7/create-signup-page`): `[MC-7] Implement mobile signup screen`

5. **Discriptionを作成する**
   - テンプレートは`.github/pull_request_template.md`を利用すること
   - 確認した変更点を元に作成すること
   - 破壊的変更があれば記載
   - 関連するissueをリンクする
     - 表記方法は`- closed #<issue_number>`とする
     - Issueも同様にBacklog IDがprefixとしてついているのでブランチのものと同じものをリンクさせる

6. **PRの設定**
   - 作成したtitleと説明文を元にPRを作成する
