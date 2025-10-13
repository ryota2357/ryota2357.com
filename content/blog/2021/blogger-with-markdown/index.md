---
title: "Bloggerをマークダウンで書く"
postdate: "2021-03-27T15:46"
update: "2021-03-27T15:46"
tags: ["Blogger"]
---

## 目標

class="markdown"を指定したタグでマークダウンがかけるようにする。

## 作業

marked.js を使います。

### スクリプト

以下のスクリプトを blogger の  
「テーマ > カスタマイズのプルダウン > HTML を編集」  
にて、body ダグの終わりの直前に記述します。

```html
<!-- Marked.js -->
<src ="https://cdn.jsdelivr.net/npm/marked/lib/marked.min.js" />
<script>
  let area = document.getElementById(&#39;markdown-renderer&#39;);
  let markdown = document.querySelectorAll(&#39;.markdown&#39;);
  for(var md of markdown) area.innerHTML += marked(md.innerHTML);
</script>
```

### cssを追加

<!-- textlint-disable ja-technical-writing/no-doubled-joshi-->

上と同じく「HTML を編集」から css を追加します。
markdwon-renderer に対しての css は必須ではありません。  
display:none を設定することで、markdown クラス内の文字を非表示にします。

<!-- textlint-enable ja-technical-writing/no-doubled-joshi-->

```css
.markdown-renderer {
  width: 100%;
  height: auto;
  overflow: scroll;
  background-color: #ffffff;
}

.markdown {
  display: none;
}
```

### テンプレートの作成

必須ではないですが、毎回ダグを面倒なので新規記事の作成時に自動で追加されるようにします。  
「設定 > 投稿 > 投稿テンプレート」  
に以下を追加します。

```html
<div id="markdown-renderer"></div>
<div class="markdown">## LargeTitle</div>
```

</script>
  
## カスタマイズ

ここまでで目標は達成しました。  
以下に僕自身のカスタマイズを残しておきます。

### aタグ

marked.js によって生成される a タグは現在のタブで開くようになっているので変更します。  
jQuery を使いました。

```html
<!-- jQuery -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3/dist/jquery.min.js" />

<!-- a_tag opsion -->
<script>
  $(&#39;#markdown-renderer a&#39;).attr(&#39;target&#39;, &#39;_blank&#39;);
</script>
```

### コードにシンタックスハイライトをつける

marked.js の marked 関数の引数にオプションを渡すことで色々できるのですが、面倒だったので、code タグに対して自動でシンタックスハイライトがかかる highlight.js を使ってます。  
以下の 3 行を記述します。

```html
<!-- highlight.js -->
<link
  href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.10/styles/vs.min.css"
  rel="stylesheet"
/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.15.10/highlight.min.js" />
<script>
  hljs.initHighlightingOnLoad();
</script>
```

### フォントを変更する

独自の日本語フォントを導入しました。  
head タグ内に書きます。

```html
<!-- Font: https://fonts.google.com/specimen/Noto+Serif+JP?subset=japanese&selection.family=Noto+Serif+JP:wght@300;700&sidebar.open=true -->
<link href="https://fonts.gstatic.com" rel="preconnect" />
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;700&amp;display=swap"
  rel="stylesheet"
/>
```

</script>
