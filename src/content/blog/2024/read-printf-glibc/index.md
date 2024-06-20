---
title: "glibcのprintf()の実装を読んでみる"
postdate: "2024-06-18T21:01"
update: "2024-06-18T21:01"
tags: ["C"]
draft: true
---

大学の授業「コンピュータサイエンス実験 J4」にて、次の課題が出された。

> printf関数を用いたとき、実際にwriteシステム・コールがよばれて出力されるのはどの時点であるかを調べてみよ。標準出力が端末であるときと、たとえば「a.out > zzz」のようにリダイレクトにより標準出力がファイルになっているときとで違うのだろうか?

[Compiler Explor](https://godbolt.org/) で `printf` をコンパイルしても `call printf` としかならないので、ライブラリ本体をみる必要があるとわかった。
ソースコードは [https://ftp.gnu.org/gnu/glibc/](https://ftp.gnu.org/gnu/glibc/)より、[glibc-2.39.tar.gz](https://ftp.gnu.org/gnu/glibc/glibc-2.39.tar.gz)を取得し、展開する。

## printf()の定義場所の探索

まずは定義場所を探す。include/stdio.h にあるかと思いきやそこに `printf` 関数の定義は書かれてない。include/stdio.h が 3 つ `#include` している。

```c
/* Workaround PR90731 with GCC 9 when using ldbl redirects in C++.  */
# include <bits/floatn.h>
# if defined __cplusplus && __LDOUBLE_REDIRECTS_TO_FLOAT128_ABI == 1
#  if __GNUC_PREREQ (9, 0) && !__GNUC_PREREQ (9, 3)
#    pragma GCC system_header
#  endif
# endif

# include <libio/stdio.h>
# ifndef _ISOMAC

#  define _LIBC_STDIO_H 1
#  include <libio/libio.h>
```

それぞれ探すと、libio/stdio.h に定義があった。

```c
extern int printf (const char *__restrict __format, ...);
```

libio/stdio.c があったので、そこに `printf` の実装があるかと期待するが、ない。

<!-- textlint-disable ja-technical-writing/sentence-length -->

余談だが、macOS で clangd の定義ジャンプすると /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/usr/include/stdio.h に `printf` の定義は見つかる。
そこからは僕は何も `printf` の実装に関する情報を掴めなかったので、glibc をみることとなった。

<!-- textlint-enable ja-technical-writing/sentence-length -->

## printf()の実装場所の探索

`find . -name "*printf*"` を打ってみると `printf.c` という、そのまんまなファイルがあるとわかった。

stdio-common/printf.c の必要な部分だけ抜き取ったのが次である。

```c
#include <libioP.h>
#include <stdarg.h>
#include <stdio.h>

int
__printf (const char *format, ...)
{
  va_list arg;
  int done;

  va_start (arg, format);
  done = __vfprintf_internal (stdout, format, arg, 0);
  va_end (arg);

  return done;
}
ldbl_strong_alias (__printf, printf);
```

マクロ `ldbl_strong_alias` によって、`printf` ができていることがわかった。

<details>
<summary> `ldbl_strong_alias` が気になったので少し追った。</summary>

```
$ rg 'ldbl_strong_alias'
...
sysdeps/generic/math_ldbl_opt.h
14:#define ldbl_strong_alias(name, aliasname) strong_alias (name, aliasname)

sysdeps/ieee754/ldbl-opt/math_ldbl_opt.h
15:# define ldbl_strong_alias(name, aliasname) \
27:# define ldbl_strong_alias(name, aliasname) strong_alias (name, aliasname)
```

ここから、`strong_alias` を目印に探すと include/libc-symbols.h に行き着いた。

```c
# define strong_alias(name, aliasname) _strong_alias(name, aliasname)
# define _strong_alias(name, aliasname) \
  extern __typeof (name) aliasname __attribute__ ((alias (#name))) \
    __attribute_copy__ (name);
```

</details>

次に調べるのは `va_start()`, `__vfprintf_internal()`, `va_end()` の 3 つである。

## va_start(), va_end()

この 2 つついてはおそらく次のように定義されている。

```c
#define va_start(ap, param) __builtin_va_start(ap, param)
#endif
#define va_end(ap)          __builtin_va_end(ap)
```

`__builtin*` 系なので、コンパイラが色々やるやつである。`va_start()`, `va_end()` を通じて可変長引数が扱えるようになっていると考えられる。
なお、この定義は glibc のものではない。
clangd の定義ジャンプを用いて、 ~/.local/..省略../clangd_17.0.3/lib/clang/17/include/stdarg.h よりとってきた。stdarg.h はコンパイラ側にあるヘッダーなのかもしれない。

stdarg.h で検索すると、`va_list`, `va_start()`, `va_arg()`, `va_end()` が定義されていると出てくるので、ここまでの考察はあっていそうである。

## \_\_vfprintf_internal() の実装

まずは定義場所から。

```
$ rg __vfprintf_internal
...
libio/libioP.h
759:extern int __vfprintf_internal (FILE *fp, const char *format, va_list ap,
...
```

libio/libioP.h の該当箇所は次の通りであった。

```c
/* Internal versions of v*printf that take an additional flags
   parameter.  */
extern int __vfprintf_internal (FILE *fp, const char *format, va_list ap,
				unsigned int mode_flags)
    attribute_hidden;
```

<details>
<summary>vfprintf(3)</summary>
「man 3 printf」より`vfprintf()`のシグネチャを確認すると、確かに`mode_flags`という `__vfprintf_internal` には `mode_flags` という引数が追加されていることが確認できた。

```c
int
vfprintf(FILE * restrict stream, const char * restrict format, va_list ap);
```

</details>

`__vfprintf_internal()` の実装は少なくとも libio/libioP.h を include している c ファイルに実装があるはずなので探す。

```
$ rg "libioP.h" -g "*.c" -l | grep vfprintf
debug/vfprintf_chk.c
stdio-common/vfprintf.c
stdio-common/vfprintf-internal.c
sysdeps/ieee754/ldbl-128ibm-compat/ieee128-vfprintf.c
sysdeps/ieee754/ldbl-128ibm-compat/ieee128-vfprintf_chk.c
```

stdio-common/vfprintf-internal.c が名前から怪しい。開いてみると `__vfprintf_internal()` の実装があった。
処理の流れがわかるように、引数チェック IO ロック部分を削除し、マクロを展開すると次のようになる。

<details>
<summary>元のstdio-common/vfprintf-internal.c</summary>

```c
# define vfprintf	__vfprintf_internal

...

/* The FILE-based function.  */
int
vfprintf (FILE *s, const CHAR_T *format, va_list ap, unsigned int mode_flags)
{
  /* Orient the stream.  */
#ifdef ORIENT
  ORIENT;
#endif

  /* Sanity check of arguments.  */
  ARGCHECK (s, format);

#ifdef ORIENT
  /* Check for correct orientation.  */
  if (_IO_vtable_offset (s) == 0
      && _IO_fwide (s, sizeof (CHAR_T) == 1 ? -1 : 1)
      != (sizeof (CHAR_T) == 1 ? -1 : 1))
    /* The stream is already oriented otherwise.  */
    return EOF;
#endif

  if (!_IO_need_lock (s))
    {
      struct Xprintf (buffer_to_file) wrap;
      Xprintf (buffer_to_file_init) (&wrap, s);
      Xprintf_buffer (&wrap.base, format, ap, mode_flags);
      return Xprintf (buffer_to_file_done) (&wrap);
    }

  int done;

  /* Lock stream.  */
  _IO_cleanup_region_start ((void (*) (void *)) &_IO_funlockfile, s);
  _IO_flockfile (s);

  /* Set up the wrapping buffer.  */
  struct Xprintf (buffer_to_file) wrap;
  Xprintf (buffer_to_file_init) (&wrap, s);

  /* Perform the printing operation on the buffer.  */
  Xprintf_buffer (&wrap.base, format, ap, mode_flags);
  done = Xprintf (buffer_to_file_done) (&wrap);

  /* Unlock the stream.  */
  _IO_funlockfile (s);
  _IO_cleanup_region_end (0);

  return done;
}
```

</details>

```c
/* The FILE-based function.  */
int __vfprintf_internal (FILE *s, const char *format, va_list ap, unsigned int mode_flags) {
  /* Set up the wrapping buffer.  */
  struct __printf_buffer_to_file wrap;
  __printf_buffer_to_file_init(&wrap, s);

  /* Perform the printing operation on the buffer.  */
  Xprintf_buffer(&wrap.base, format, ap, mode_flags);
  return __printf_buffer_to_file_done(&wrap);
}
```

やっていることは、バッファの初期化、書き込み、書き込み完了の 3 つでそれぞれ関数に分けられていることがわかる。

次に調べるのは、`__printf_buffer_to_file_init()` と `__printf_buffer_to_file_done()` にする。
`Xprintf_buffer()` stdio-common/vfprintf-internal.c にあるのだが、はマクロや `goto` が入り乱れ、全く読める気がしないので読まない。
なんとなく見た感じ `format` と `ap` を解釈してバッファ(`&wrap.base`)への書き込みを `Xprintf_buffer_write()` などを通じて行っていそうである。

`Xprintf_buffer_write()` は `stdio-common/Xprintf_buffer_write.c` にあり次の通り。
`memcpy` で読み取りバッファの内容を書き出しのバッファへコピーしている。

```c
void
Xprintf_buffer_write (struct Xprintf_buffer *buf,
                        const CHAR_T *s, size_t count)
{
  if (__glibc_unlikely (Xprintf_buffer_has_failed (buf)))
    return;

  while (count > 0)
    {
      if (buf->write_ptr == buf->write_end && !Xprintf_buffer_flush (buf))
        return;
      assert (buf->write_ptr != buf->write_end);
      size_t to_copy = buf->write_end - buf->write_ptr;
      if (to_copy > count)
        to_copy = count;
      MEMCPY (buf->write_ptr, s, to_copy);
      buf->write_ptr += to_copy;
      s += to_copy;
      count -= to_copy;
    }
}
```

<details>
<summary>stdio-common/vfprintf.cも気になったので覗いてみた</summary>
`__vfprintf_internal()` の実装は見つかったが、stdio-common/vfprintf.c も少し怪しいので覗いてみた。

```c
extern int
__vfprintf (FILE *fp, const char *format, va_list ap)
{
  return __vfprintf_internal (fp, format, ap, 0);
}
ldbl_strong_alias (__vfprintf, _IO_vfprintf);
ldbl_strong_alias (__vfprintf, vfprintf);
ldbl_hidden_def (__vfprintf, vfprintf)
```

`vfprintf(fp, format, ap)` の実装は `__vfprintf_internal(fp, format, ap, 0)` であることがわかった。

</details>

## 構造体 \_\_printf_buffer_to_file

構造体 `__printf_buffer_to_file` はすぐ見つかる。

```
$ rg "struct __printf_buffer_to_file"
...
stdio-common/printf_buffer_to_file.h
25:struct __printf_buffer_to_file
...
```

stdio-common/printf_buffer_to_file.h に構造体の定義がある。

```c
#include <printf_buffer.h>

struct __printf_buffer_to_file
{
  struct __printf_buffer base;
  FILE *fp;

  /* Staging buffer. Used if fp does not have any available buffer space. */
  char stage[PRINTF_BUFFER_SIZE_TO_FILE_STAGE];
};
```

`__printf_buffer` 構造体の定義は include/printf_buffer.h にあり、次の通りである。

```c
struct __printf_buffer
{
  /* These pointer members follow FILE streams.
     write_ptr and write_end must be initialized to cover the target buffer. See __printf_buffer_init.
     Data can be written directly to *write_ptr while write_ptr != write_end, and write_ptr can be advanced accordingly.
     Note that is not possible to use the apparently-unused part of the buffer as scratch space because sprintf (and snprintf, but that is a bit iffy) must only write the minimum number of characters produced by the format string and its arguments.

     write_base must be initialized to be equal to write_ptr.
     The framework uses this pointer to compute the total number of written bytes, together with the written field. See __printf_buffer_done.

     write_base and write_end are only read by the generic functions after initialization, only the flush implementation called from __printf_buffer_flush might change these pointers.
     See the comment on Xprintf (buffer_do_flush) in Xprintf_buffer_flush.c for details regarding the flush operation. */
  char *write_base;
  char *write_ptr;
  char *write_end;

  /* Number of characters written so far (excluding the current buffer).
     Potentially updated on flush.
     The actual number of written bytes also includes the unflushed-but-written buffer part, write_ptr - write_base.  A 64-bit value is used to avoid the need for overflow checks.  */
  uint64_t written;

  /* Identifies the flush callback.  */
  enum __printf_buffer_mode mode;
};
```

コメントに書かれている通りだが、簡単に整理する。

- `write_ptr != write_end` の間書き込みが行われ、`write_ptr` を書き込みながら進める。
- 初期化時には `write_base == write_ptr` となるようにし、`write_ptr` から `write_end` がターゲットのバッファ全体をカバーするようにする。
- `write_base` と `write_ptr` を見て、書き込まれたバイト数を計算する。

## \_\_printf_buffer_to_file_init() の実装

```
$ rg "__printf_buffer_to_file_init"
...
stdio-common/printf_buffer_to_file.c
107:__printf_buffer_to_file_init (struct __printf_buffer_to_file *buf, FILE *fp)
...
```

stdio-common/printf_buffer_to_file.c に実装がある。
`__printf_buffer_to_file_switch()` が同じファイル内にあり、`__printf_buffer_init()` は include/printf_buffer.h にある。

```c
void
__printf_buffer_to_file_init (struct __printf_buffer_to_file *buf, FILE *fp)
{
  __printf_buffer_init (&buf->base, buf->stage, array_length (buf->stage),
                        __printf_buffer_mode_to_file);
  buf->fp = fp;
  __printf_buffer_to_file_switch (buf);
}
```

順に `__printf_buffer_init()` から見ていく。

```c
/* Initialization of a buffer, using the memory region from [BASE, END) as the initial buffer contents.  */
static inline void
__printf_buffer_init_end (struct __printf_buffer *buf, char *base, char *end,
                          enum __printf_buffer_mode mode)
{
  buf->write_base = base;
  buf->write_ptr = base;
  buf->write_end = end;
  buf->written = 0;
  buf->mode = mode;
}

/* Initialization of a buffer, using the memory region from [BASE, BASE +LEN) as the initial buffer contents.  LEN can be zero.  */
static inline void
__printf_buffer_init (struct __printf_buffer *buf, char *base, size_t len,
                      enum __printf_buffer_mode mode)
{
  __printf_buffer_init_end (buf, base, base + len, mode);
}
```

単純に渡された引数で初期化しているだけのようである。

続いて `__printf_buffer_to_file_switch()` をみると、
構造体 `__printf_buffer_to_file` にあった `stage` フィールドは `write_ptr == write_end` の時に使われるもだったとわかる。
どのような時に `write_ptr == write_end` となるのかは分からない。

```c
/* Switch to the file buffer if possible.  If the file has write_ptr == write_end, use the stage buffer instead.  */
void
__printf_buffer_to_file_switch (struct __printf_buffer_to_file *buf)
{
  if (buf->fp->_IO_write_ptr < buf->fp->_IO_write_end)
    {
      /* buf->fp has a buffer associated with it, so write directly to it from now on. */
      buf->base.write_ptr = buf->fp->_IO_write_ptr;
      buf->base.write_end = buf->fp->_IO_write_end;
    }
  else
    {
      /* Use the staging area if no buffer is available in buf->fp. */
      buf->base.write_ptr = buf->stage;
      buf->base.write_end = array_end (buf->stage);
    }

  buf->base.write_base = buf->base.write_ptr;
}
```

### `__printf_buffer_to_file_init()` が構築するもの

1 回関数の呼び出しを整理する。

```c
struct __printf_buffer_to_file wrap;
__printf_buffer_to_file_init(&wrap, s);

void __printf_buffer_to_file_init (struct __printf_buffer_to_file *buf, FILE *fp) {
  __printf_buffer_init (&buf->base, buf->stage, array_length (buf->stage), __printf_buffer_mode_to_file);
  buf->fp = fp;
  __printf_buffer_to_file_switch (buf);
}
```

実際に構築される `struct __printf_buffer_to_file` フィールドを追ってみると次の値を持つとわかった。

```c
char stage[PRINTF_BUFFER_SIZE_TO_FILE_STAGE];

struct __printf_buffer base = {
    write_base: stage,
    write_ptr: stage + array_length(stage),
    write_end: stage,
    written: 0,
    mode: __printf_buffer_mode_to_file,
};

struct __printf_buffer_to_file wrap = {
    .base: base,
    .fp: stdout,
    .stage: stage,
};
```

`__vfprintf_internal()` 内の `wrap` がどのようなものだったのか、ここでようやく分かった。
この `&wrap.base` が `Xprintf_buffer()` に渡されて、`stage` への書き込みが行われると分かった。

<!-- これは予測なのだが、`stage` がいっぱいになったら flush が呼ばれて実際の -->

## \_\_printf_buffer_to_file_done() の実装

`__printf_buffer_init()` と同じファイル(stdio-common/printf_buffer_to_file.c)に実装がある。

```c
int
__printf_buffer_to_file_done (struct __printf_buffer_to_file *buf)
{
  if (__printf_buffer_has_failed (&buf->base))
    return -1;
  __printf_buffer_flush_to_file (buf);
  return __printf_buffer_done (&buf->base);
}
```

## \_\_printf_buffer_has_failed(), \_\_printf_buffer_done() の実装

```
$ rg 'Xprintf \(buffer_has_failed\)'
include/printf_buffer.h
284:#define Xprintf_buffer_has_failed Xprintf (buffer_has_failed)

$ rg 'Xprintf \(buffer_done\)'
include/printf_buffer.h
282:#define Xprintf_buffer_done Xprintf (buffer_done)
```

共に include/printf_buffer.h に記載がある。
`__printf_buffer_has_failed()` はそのヘッダファイルに実装があった。

```c
/* Returns true if the sticky error indicator of the buffer has been set to failed. */
static inline bool __attribute_warn_unused_result__
__printf_buffer_has_failed (struct __printf_buffer *buf)
{
  return buf->mode == __printf_buffer_mode_failed;
}
```

`__printf_buffer_done()` は見つからなかったので、`Xprintf_buffer_done` で `rg` すると stdio-common/Xprintf_buffer_done.c がヒットする。

```c
int
Xprintf_buffer_done (struct Xprintf_buffer *buf)
{
  if (Xprintf_buffer_has_failed (buf))
    return -1;

  /* Use uintptr_t here because for sprintf, the buffer range may cover more than half of the address space.  */
  uintptr_t written_current = buf->write_ptr - buf->write_base;
  int written_total;
  if (INT_ADD_WRAPV (buf->written, written_current, &written_total))
    {
      __set_errno (EOVERFLOW);
      return -1;
    }
  else
    return written_total;
}
```

## \_\_printf_buffer_flush_to_file() の実装

stdio-common/printf_buffer_to_file.c にある。色々やってる。
