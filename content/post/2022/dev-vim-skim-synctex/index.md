---
title: "vim(nvim)とskimでsynctexできるようにするプラグイン作った"
postdate: "2022-06-22T23:18"
update: "2022-06-22T23:18"
tags: ["Vim", "NeoVim"]
---

vimtex 使えば synctex できるのだけど、僕は vimtex を使いたくないので自作した。

https://github.com/ryota2357/vim-skim-synctex

## 動機

僕は latex を vim で書いていのだけど、vimtex を使っていない。オールインワンな雰囲気のある vimtex は使いたくなかったからである。

ddc.vim, nvim-lsp, vsnip で基本的には問題ないのだけど、synctex あったら便利だなーと思ってたので作った。

## 説明

関数のみを提供するプラグインにした。

| 関数名                 | 説明                                         |
| :--------------------- | :------------------------------------------- |
| synctex#start()        | synctex を現在のバッファに対して開始         |
| synctex#stop()         | synctex 停止                                 |
| synctex#option()       | オプションをセットする (`:h synctex-option`) |
| synctex#forwardSerch() | マウスカーソルの位置で forward serch を行う  |

まあ、あとデバッグように`synctex#status()`っていうのもあるんだけど、使うことはほぼないと思う。

注意点として、synctex を有効にできるのは 1 つのバッファに対してのみである。複数扱う場合は`stop()`して有効にしたいバッファで`start()`する必要がある。停止(`stop()`)はどこからでも ok。

他細かいことは [README](https://github.com/ryota2357/vim-skim-synctex/blob/main/README.md) か [help](https://github.com/ryota2357/vim-skim-synctex/blob/main/doc/synctex.txt) に書いた。

僕は次のように設定して使用している。(dein 使用)

```toml
[[plugins]]
repo = 'ryota2357/vim-skim-synctex'
depends = 'denops.vim'
on_ft = 'tex'
hook_source = '''
  call synctex#option('readingBar', v:true)
  call synctex#option('autoQuit', v:true)
  call synctex#start()
'''
[plugins.ftplugin]
tex = '''
  nnoremap <buffer> <Leader>s <Cmd>call synctex#forwardSerch()<CR>
'''
```

### 補足

synctex を使用するには、そもそも latex のコンパイル時に`synctex`オプションを有効にする必要がある。

latexmk を使ってるなら`.latexmkrc`の`$latex`の部分はこんな感じにする必要がある。

```parl
$latex = 'platex -synctex=1';
```

`platex`じゃなくて`uplatex`を使ってる人(僕もそう)も、同じ。

```parl
$latex = 'uplatex -synctex=1';
```

で ok。

## 実装について

[denops.vim](https://github.com/vim-denops/denops.vim)を使って作成した。  
ほとんどを typescript で実装できたのはとても快適だった。

実装は 2 つのクラスに分けた。  
メインの処理は [Application クラス](https://github.com/ryota2357/vim-skim-synctex/blob/main/denops/synctex/lib/application.ts)で、外部との通信関係は [SynctexServer クラス](https://github.com/ryota2357/vim-skim-synctex/blob/main/denops/synctex/lib/synctexServer.ts)で行っている。

denops から呼ばれる`main()`がある [main.ts](https://github.com/ryota2357/vim-skim-synctex/blob/main/denops/synctex/main.ts) は Application クラスの public メソッドを呼ぶだけのシンプルな内容にした。

### forward serch

apple script (javascript) を`call system()`で実行してる。  
実装のメイン部分だけ切り出したのが次。Application 側から SynctexServer に「リクエストを送る」という形をとってみた。

```typescript
// class SynctexServer
public async request(denops: Denops, request: ForwardSearchRequest) {
  await denops.cmd("call system(['sh', '-c', script])", {
    script: [
      `osascript -l JavaScript -e '`,
      `var app = Application("Skim");`,
      `if(app.exists()) {`,
      `  ${request.activate ? "app.activate();" : ""}`,
      `  app.open("${request.pdfFile}");`,
      `  app.document.go({to: ${request.line}, from: "${request.texFile}", showingReadingBar: ${request.readingBar}});`,
      `}'`,
    ].join(" "),
  });
}
```

### backward serch

サーバーを立てて、skim がそのサーバーに情報を`POST`、denops 側でそのリクエストを処理している。

リクエストの処理部分を抜き出すとこんな感じ。  
面倒なところは全て SynctexServer に投げてる。SynctexServer に listener をセットするスタイルにしてみた。

```typescript
// class Application
this.server.setListener(async (request: Request) => {
  switch (request.method) {
    case "GET":
      return null
    case "PUT": {
      const data = await request.text()
      const line = parseInt(data.split(" ")[0])
      const file = data.split(" ")[1]
      const currentBuf = (await func.expand(this.denops, "%:p")) as string
      if (file == this.attachedBuf && file == currentBuf) {
        await func.cursor(this.denops, line, 1)
      }
      return data
    }
    default:
      return undefined
  }
})
```

### Vim Script 部分

ここが一番苦労したところ、`autoload`の部分。

前提として denops は vim を開いた後、非同期に denops サーバーが立ち上がって、その後に各種プラグイン(typescript 部分)を読み込む。ここにある程度時間がかかる。  
そのため、vim によってプラグインが読み込まれていたとしても、denops サーバーが立ち上がっていないことや、typescript 部分のプラグインが読み込まれてないことがある。

つまり、`autoload/synctex.vim`に

```vim
function! synctex#start() abort
  call denops#notify('synctex', 'start', [])
endfunction
```

と書いて、起動時や起動直後に`call synctex#start`をすると`denops#notify`のところでエラーになる(denops サーバ立ち上がってない or synctex なんてプラグインない(読み込まれてない)ってなる)。  
また、`denops#plugin#wait_async({plugin}, {callback})`と組み合わせたとても、エラーになってしまう。

### 解決策

ddc.vim の実装では、その問題を解決していた。

ほぼそのままパクってきた。次の関数を用意する。

```vim
function! s:notify(method, args) abort
  if s:is_running()
    call denops#notify('synctex', a:method, a:args)
  else
    execute printf('autocmd User DenopsPluginPost:synctex call ' .
          \ 'denops#notify("synctex", "%s", %s)',
          \ a:method, string(a:args))
  endif
endfunction

function! s:is_running() abort
  return exists('g:loaded_denops')
        \ && denops#server#status() ==# 'running'
        \ && denops#plugin#is_loaded('synctex')
endfunction
```

で、こうする。

```vim
function! synctex#start() abort
  call s:notify('start', [])
endfunction
```

読めばわかると思うが、`autocmd`を生成している。あと、`is_running()`の判定が 3 つも必要だったみたい。

## 最後に

denops 初挑戦以前に、Deno 開発初めてだし、そもそも typescript 書いたことなかったので、色々調べながら(聞きながら)で少し時間かかったけど楽しかった。

ありがとうございました。
