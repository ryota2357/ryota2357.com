---
title: "[Blogger]「オフスクリーン画像の遅延読み込み」の対策"
postdate: "2021-07-21T00:08"
update: "2021-07-21T00:08"
tags: ["Blogger"]
---

PageSpeed Insights で言われるやつです。  
「画像を遅延読み込みしろ」と

html を書き換えるのは面倒なので、javascript を書いて自動で遅延読み込みされるようにしました。
`lazysizes` というものを使います。

GiiHub のリポジトリはこれ、[https://github.com/aFarkas/lazysizes](https://github.com/aFarkas/lazysizes)

## テンプレートの編集

blogger の「テーマ > HTML を編集」にて以下を挿入します(async で読み込んでいるので head とかに書いても良い)。

```html
<!-- lazysizes -->
<script
  async="async"
  src="https://cdn.jsdelivr.net/npm/lazysizes@5/lazysizes.min.js"
/>
```

続いて `</body>` ダグの直前に以下の javascript をスクリプトタグとかを使って埋め込めば OK です。

```js
// lazysizes
var imgs = document.getElementsByTagName("img");
for (var img of imgs) {
  img.classList.add("lazyload");
  let src = img.getAttribute("src");
  img.setAttribute("data-src", src);
  img.removeAttribute("src");
}
```

### 解説

やってることは簡単です。

1. CDN で lazysizes を取得
1. img タグを取得して class、lazyload を追加
1. img タグの src を data-src に変更

以上です。
