# Create Pull Request

## 概要

現在のブランチブランチから特定のブランチへのPull Requestを作成する。

## ルール

- 日本語での回答・作成を基本とする
- 文体は常体で回答・作成すること

## 手順

1. **ブランチの前準備**

   - すべての変更がコミットされていることを確認
   - ブランチをリモートにプッシュ

2. **変更点を作成する**

   - 現在のブランチのとMerge先のブラントの変更点を確認する
   - これらの変更を確認するコマンドを使用してその内容を確認すること
     - `git diff --stat origin/{対象のブランチ}..HEAD`
     - `git log --oneline origin/{対象のブランチ}..HEAD`

3. **Titleを作成する**

   - PRのタイトルは基本的にブランチ名を詳しくかつ内容を簡潔にしたものにする。
   - ブランチにはバックログの番号が振られている(例: MC-13)。これを `[{Backlog ID}]`このようなフォーマットで接頭辞としてタイトルにつけること。
   - 例(ブランチ名: `MC-7/create-signup-page`): `[MC-7] Implement mobile signup screen`

4. **Discriptionを作成する**

   - テンプレートは`.github/pull_request_template.md`を利用すること
   - 確認した変更点を元に作成すること
   - 破壊的変更があれば記載
   - UI変更がある場合はスクリーンショットを追加
   - 関連するissueをリンクする
     - 表記方法は`- closed #<issue_number>`とする
     - Issueも同様にBacklog IDがprefixとしてついているのでブランチのものと同じものをリンクさせる

5. **PRの設定**
   - 作成したtitleと説明文を元にPRを作成する
