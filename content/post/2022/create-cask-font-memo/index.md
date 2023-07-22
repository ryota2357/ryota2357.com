---
title: "homebrew-cask-fonts に新しいフォントを追加したのでそのメモ"
postdate: "2022-11-06T14:38"
update: "2022-11-06T14:38"
tags: ["Homebrew"]
---

1 ヶ月ほど前に[PlemolJP](https://github.com/yuru7/PlemolJP)を homebrew-cask-fonts に追加した。

数日前、 PlemolJP に新しいフォントスタイルができて cask を追加する必要があった。cask 追加方法を忘れてたのでメモしておくことにした。

## 手順メモ

1. [CONTRIBUTING.md](https://github.com/Homebrew/homebrew-cask-fonts/blob/master/CONTRIBUTING.md)読む。
   - 登録するときの font の名前つけ方法とか書いてある。
   - Ruby ファイルに何書けばいいかとかも。
1. 実際に cask 作る時は[homebrew-cask の CONTRIBUTING.md](https://github.com/Homebrew/homebrew-cask/blob/master/CONTRIBUTING.md)読んで、適宜 cask-fonts に読み替える。
   1. homebrew-cask-fonts の repo をクローン
   1. ターミナルへ
   1. `$ github_user='<my-github-username>'`
   1. `$ cd "$(brew --repository)"/Library/Taps/homebrew/homebrew-cask-fonts`
   1. `$ git remote add "${github_user}" "https://github.com/${github_user}/homebrew-cask-fonts"`
   1. 適当にブランチ作って Ruby ファイル作成
1. Ruby ファイルできたら、brew install とかしてみて手元で動くか確認してみる(しなくてもいいけど。)
1. PR 作る。
1. PR テンプレートに書いてあることに従って作業
