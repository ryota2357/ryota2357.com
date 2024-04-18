---
title: "Firefoxでタブバーを消す方法のメモ"
postdate: "2024-04-18T22:38"
update: "2024-04-18T22:38"
tags: ["Firefox"]
---

個人メモです。動作の保証はしません。MacOS 版の Firefox です。

まず、`about:config` より `toolkit.legacyUserProfileCustomizations.stylesheets` を true にする。

![about:config](./about-config.png)

次に、`about:support` よりプロファイルフォルダーを確認し、そこを開く。

![about:support](./about-support.png)

最後に、 `{プロファイルフォルダー}/chrome/userChrome.css` に次の内容を記載する。

```css
#titlebar {
  visibility: collapse !important;
}
```

以上で、こんな感じになる。

![done](./done.png)
