---
title: "僕のコミットメッセージの prefix メモ"
postdate: "2025-01-21T21:30"
update: "2025-01-21T21:30"
tags: ["Git"]
---

ベース: [angular/angular CONTRIBUTING.md#-commit-message-format](https://github.com/angular/angular/blob/2d8fa73c1d6cce078889548c69b8ddb8e84ac106/CONTRIBUTING.md#-commit-message-format)

随時更新、現在使用しているもののメモ。
自分のリポジトリ以外にコントリビュートする際はそのリポジトリの commit log を見て合わせるようにしている。

## フォーマット

ライブラリ等の独立したもの：

```
<type>: <message>
```

ある程度の規模で複数のモジュール・パッケージ・機能が存在する場合：

```
<type>(<scope>): <message>
```

### \<type\>

- ci: GitHub Action の設定とか
- docs: ドキュメントの更新や修正
- feat: 新規機能、新規追加のモジュール等
- fix: バグの修正、typo の修正は別
- perf: パフォーマンス改善
- refactor: リファクタリング
- style: 主に formatter による変更。コード中の空白や改行などのみの変更
- test: 新規テストの追加、既存のストの改善
- chore: その他

依存関係のアップデートは build などを使わず、chore や feat などそのアップデートがもたらす意味からプレフィックスを選ぶ。

### \<scope\>

例: `common`, `parser`, など。

プロジェクトに依存する。1 つのコミットでしか使わないようなものはつけない。

### \<message\>

英語。短めに書くこと。

追加情報等があり、メッセージを長く書く必要がある場合は 2 行目を空行としてそれ以降に記述する。
