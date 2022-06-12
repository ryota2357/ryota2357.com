---
title: "denops.vimでvimscriptの関数をtypescriptに渡したかった"
postdate: "2022-06-12T21:33"
update: "2022-06-12T21:33"
tags: ["Vim", "Denops"]
---

vim プラグインを作ってる時、vimscript で作った匿名関数を typescript に渡して任意のタイミングで typescript から実行したい時があった。  
他の変数と同じように`denops#notify()`とかで渡すと、関数は`null`になってしまう。

結論から言うと、直接関数を渡す方法はわからなかった。しかし、`denops#callback#register()`と`denops#callback#call()`を用いると、id を経由することやりたいことはできた。

## 例

それぞれ、help を引用しておく。

<details>
<summary>denops#callback#register()</summary>

> ```
> denops#callback#register({callback}[, {options}])
>        Register {callback} to internal callback map as an anonymous function
>        and return an unique {id} to call the {callback} later.
>        The following attributes are available on {options}.
> ```

</details>

<details>
<summary>denops#callback#call()</summary>

> ```
> denops#callback#call({id}[, {args}...])
>         Find a callback of {id} from internal callback map and call it with
>         given {args} and return a result. It throw an error when no {id}
>         callback exists.
>         Note that the callback called is automatically removed from the
>         internal callback map if "once" option had specified.
> ```

</details>

こんな感じで使える。

typescript 側は次のように id を受け取る。

<!-- prettier-ignore -->
```typescript
export function main(denops: Denops): void {
  denops.dispatcher = {
    async addFunc(funcId: unknown): Promise<void> {
      const id = unknown.ensureString(funcId);
      const ret = await denops.call("denops#callback#call", id, "hoge");
      console.log(ret);
    },
  }
}
```

vimscript 側では、id を生成して渡す。

```vim
function! somePlug#addFunc(func) abort
  let l:id = denops#callback#register(a:func)
  call denops#notify('somePlug', 'addFunc', [l:id])
endfunction
```

次のように期待通りの動作をする。

```txt
:call somePlug#addFunc({ arg -> arg . '!!'})
[denops] hoge!!
```
