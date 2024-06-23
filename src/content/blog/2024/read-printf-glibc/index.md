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

## まとめ

<div class="summary_overflow_list">

1. `__printf(const char *format, ...)` (stdio-common/printf.c)
   - `va_start()` と `va_end()` により可変長引数を処理し、`arg` とする。
   - `__vfprintf_internal(stdout, format, arg, 0)` を呼び出す。
1. `__vfprintf_internal(FILE *fp, const char *format, va_list ap, unsigned int mode_flags)` (stdio-common/vfprintf-internal.c)
   - 書き込むポインタやバッファなど情報を格納する ` struct __printf_buffer_to_file wrap;` を用意する。
   - `__printf_buffer_to_file_init(&wrap, s);` で `wrap` を初期化。
   - `Xprintf_buffer(&wrap.base, format, ap, mode_flags);` でバッファに書き込む。
   - `__printf_buffer_to_file_done(&wrap);` で書き込み完了。
1. `__printf_buffer_to_file_init(struct __printf_buffer_to_file *buf, FILE *fp)` (stdio-common/printf_buffer_to_file.c)
   - `__printf_buffer_init(&buf->base, buf->stage, array_length (buf->stage), __printf_buffer_mode_to_file);` で base バッファを初期化。
   - `__printf_buffer_to_file_switch(buf);` で出力先のバッファを切り替える。

</div>
<style>
.summary_overflow_list {
    overflow-x: auto;
    white-space: nowrap;
    border: 1px solid #ccc;
    padding: 5px;
}
.summary_overflow_list li {
    line-height: 1.8 !important;
}
</style>

## 探索記録

自分の探索ログを残す。
一応、読めるように整えはしたが読みにくいと思う。

### printf()の定義場所の探索

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

### printf()の実装場所の探索

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

### va_start(), va_end()

この 2 はおそらく次のように定義されている。

```c
#define va_start(ap, param) __builtin_va_start(ap, param)
#endif
#define va_end(ap)          __builtin_va_end(ap)
```

`__builtin*` 系なので、コンパイラが色々やるやつである。`va_start()`, `va_end()` を通じて可変長引数が扱えるようになっていると考えられる。
なお、この定義は glibc のものではない。
clangd の定義ジャンプを用いて、 ~/.local/..省略../clangd_17.0.3/lib/clang/17/include/stdarg.h よりとってきた。stdarg.h はコンパイラ側にあるヘッダーなのかもしれない。

stdarg.h で Google 検索すると、`va_list`, `va_start()`, `va_arg()`, `va_end()` が定義されていると出てくるので、ここまでの考察はあっていそうである。

### \_\_vfprintf_internal() の実装

```
$ rg __vfprintf_internal
...
libio/libioP.h
759:extern int __vfprintf_internal (FILE *fp, const char *format, va_list ap,
...
```

libio/libioP.h の該当箇所は次の通りであった。

```c
/* Internal versions of v*printf that take an additional flags parameter.  */
extern int __vfprintf_internal (FILE *fp, const char *format, va_list ap,
				unsigned int mode_flags)
    attribute_hidden;
```

<details>
<summary>vfprintf(3)</summary>
「man 3 printf」より`vfprintf()`のシグネチャを確認すると、確かに`mode_flags`という `__vfprintf_internal` には `mode_flags` という引数が追加されていることが確認できた。

```c
int vfprintf(FILE * restrict stream, const char * restrict format, va_list ap);
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
<summary>元の__vfprintf_internal()</summary>

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

この `Xprintf_buffer_write()` で使われている `Xprintf_buffer_flush()` は `__printf_buffer_to_file_init()` の実装を見た後じゃないとわからないのだが、
次の流れの通り呼び出される。

1. `Xprintf_buffer_flush()` (stdio-common/Xprintf_buffer_flush.c)
1. `__printf_buffer_do_flush()` (stdio-common/printf_buffer_flush.c)
1. `__printf_buffer_flush_to_file()` (stdio-common/printf_buffer_to_file.c)

### 構造体 \_\_printf_buffer_to_file

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

### \_\_printf_buffer_to_file_init() の実装

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

どのような時に `write_ptr == write_end` となるのかは分からない。
`stdout` の実装を追ったのだが、マクロが多くて読めなかったので、docker で ubuntu を立ち上げて、次を実行してみた。

<details>
<summary>stdout の実装を追ったログ</summary>

```
$ rg stdout -g "*.h"
libio/stdio.h
150:extern FILE *stdout;                /* Standard output stream.  */
154:#define stdout stdout
```

libio/stdio.h に宣言されている。extern と define があるので、一応周辺を見てみる。

```c
/* Standard streams.  */
extern FILE *stdin;		/* Standard input stream.  */
extern FILE *stdout;		/* Standard output stream.  */
extern FILE *stderr;		/* Standard error output stream.  */
/* C89/C99 say they're macros.  Make them happy.  */
#define stdin stdin
#define stdout stdout
#define stderr stderr
```

C89/C99 への対応のために、マクロで宣言されていることがわかった。extern の実態はどこにあるのか探す。

```
rg "FILE.*stdout"
...
libio/stdio.c
34:FILE *stdout = (FILE *) &_IO_2_1_stdout_;
...
```

`_IO_2_1_stdout_` を探す。

```
$ rg _IO_2_1_stdout_ -g '*.c'
...
libio/stdfiles.c
28:/* This file provides definitions of _IO_2_1_stdin_, _IO_2_1_stdout_,
53:DEF_STDFILE(_IO_2_1_stdout_, 1, &_IO_2_1_stdin_, _IO_NO_READS);
54:DEF_STDFILE(_IO_2_1_stderr_, 2, &_IO_2_1_stdout_, _IO_NO_READS+_IO_UNBUFFERED);
```

libio/stdfiles.c を開いてみる。

```c
#include "libioP.h"

#ifdef _IO_MTSAFE_IO
# define DEF_STDFILE(NAME, FD, CHAIN, FLAGS) \
  static _IO_lock_t _IO_stdfile_##FD##_lock = _IO_lock_initializer; \
  static struct _IO_wide_data _IO_wide_data_##FD \
    = { ._wide_vtable = &_IO_wfile_jumps }; \
  struct _IO_FILE_plus NAME \
    = {FILEBUF_LITERAL(CHAIN, FLAGS, FD, &_IO_wide_data_##FD), \
       &_IO_file_jumps};
#else
# define DEF_STDFILE(NAME, FD, CHAIN, FLAGS) \
  static struct _IO_wide_data _IO_wide_data_##FD \
    = { ._wide_vtable = &_IO_wfile_jumps }; \
  struct _IO_FILE_plus NAME \
    = {FILEBUF_LITERAL(CHAIN, FLAGS, FD, &_IO_wide_data_##FD), \
       &_IO_file_jumps};
#endif

DEF_STDFILE(_IO_2_1_stdin_, 0, 0, _IO_NO_WRITES);
DEF_STDFILE(_IO_2_1_stdout_, 1, &_IO_2_1_stdin_, _IO_NO_READS);
DEF_STDFILE(_IO_2_1_stderr_, 2, &_IO_2_1_stdout_, _IO_NO_READS+_IO_UNBUFFERED);

struct _IO_FILE_plus *_IO_list_all = &_IO_2_1_stderr_;
libc_hidden_data_def (_IO_list_all)
```

`DEF_STDFILE` マクロ内に、`FILEBUF_LITERAL` マクロがあるので、それを探す。

```
$ rg FILEBUF_LITERAL
...
libio/libioP.h
905:#  define FILEBUF_LITERAL(CHAIN, FLAGS, FD, WDP) \
910:#  define FILEBUF_LITERAL(CHAIN, FLAGS, FD, WDP) \
918:#  define FILEBUF_LITERAL(CHAIN, FLAGS, FD, WDP) \
923:#  define FILEBUF_LITERAL(CHAIN, FLAGS, FD, WDP) \
...
```

libio/libioP.h にあるので、開いてみる。

```c
#ifdef _IO_MTSAFE_IO
/* check following! */
# ifdef _IO_USE_OLD_IO_FILE
#  define FILEBUF_LITERAL(CHAIN, FLAGS, FD, WDP) \
       { _IO_MAGIC+_IO_LINKED+_IO_IS_FILEBUF+FLAGS, \
	 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, (FILE *) CHAIN, FD, \
	 0, _IO_pos_BAD, 0, 0, { 0 }, &_IO_stdfile_##FD##_lock }
# else
#  define FILEBUF_LITERAL(CHAIN, FLAGS, FD, WDP) \
       { _IO_MAGIC+_IO_LINKED+_IO_IS_FILEBUF+FLAGS, \
	 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, (FILE *) CHAIN, FD, \
	 0, _IO_pos_BAD, 0, 0, { 0 }, &_IO_stdfile_##FD##_lock, _IO_pos_BAD,\
	 NULL, WDP, 0 }
# endif
#else
# ifdef _IO_USE_OLD_IO_FILE
#  define FILEBUF_LITERAL(CHAIN, FLAGS, FD, WDP) \
       { _IO_MAGIC+_IO_LINKED+_IO_IS_FILEBUF+FLAGS, \
	 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, (FILE *) CHAIN, FD, \
	 0, _IO_pos_BAD }
# else
#  define FILEBUF_LITERAL(CHAIN, FLAGS, FD, WDP) \
       { _IO_MAGIC+_IO_LINKED+_IO_IS_FILEBUF+FLAGS, \
	 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, (FILE *) CHAIN, FD, \
	 0, _IO_pos_BAD, 0, 0, { 0 }, 0, _IO_pos_BAD, \
	 NULL, WDP, 0 }
# endif
#endif
```

もう無理...

</details>

```
$ docker run -it --rm --platform linux/amd64 ubuntu

root@***/# dpkg -l | grep libc6
ii  libc6:amd64             2.39-0ubuntu8.1        amd64        GNU C Library: Shared libraries
root@***/# apt-get update -y && apt-get install -y gcc vim
...
root@***/# cd /tmp
root@***/tmp# vim main.c
root@***/tmp# cat main.c
#include<stdio.h>
int main() {
    printf("(dummy printf call)\n");
    printf("stdout->_IO_write_ptr: %p\n", stdout->_IO_write_ptr);
    printf("stdout->_IO_write_end: %p\n", stdout->_IO_write_end);
    return 0;
}
root@***/tmp# gcc main.c
root@***/tmp# ./a.out
(dummy printf call)
stdout->_IO_write_ptr: 0x5555555592a0
stdout->_IO_write_end: 0x5555555592a0
root@***:/tmp# ./a.out > zzz
root@***:/tmp# cat zzz
(dummy printf call)
stdout->_IO_write_ptr: 0x5555555592b4
stdout->_IO_write_end: 0x55555555a2a0
```

どのような実装で `_IO_write_ptr` と `_IO_write_end` をセットしているのかはわからないが、動作させた限りでは次のような挙動を示した。

- ターミナルへの出力の時: `_IO_write_ptr == _IO_write_end`
- ファイルへのリダイレクトの時: `_IO_write_ptr < _IO_write_end`

ここまでで、`__printf_buffer_to_file_init()` が構築する `struct __printf_buffer_to_file` のフィールドを追ってみると次の値を持つとわかった。

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

// __printf_buffer_to_file_switch() で write_ptr と write_end が切り替わる
if (stdout->_IO_write_ptr < stdout->_IO_write_end) {
    // ファイルへのリダイレクトの時？
    wrap.base.write_ptr = stdout->_IO_write_ptr;
    wrap.base.write_end = stdout->_IO_write_end;
} else {
    // ターミナル出力の時？
    wrap.base.write_ptr = stage;
    wrap.base.write_end = array_end(stage);
}
```

`__vfprintf_internal()` 内の `wrap` がどのようなものだったのか、ここでようやく分かった。
この `&wrap.base` が `Xprintf_buffer()` に渡されて、`stage` への書き込みが行われると分かった。

### \_\_printf_buffer_to_file_done() の実装

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

続いて `__printf_buffer_has_failed()`、 `__printf_buffer_flush_to_file()`、`__printf_buffer_done()` を追っていく。

### \_\_printf_buffer_has_failed() の実装

```
$ rg 'Xprintf \(buffer_has_failed\)'
include/printf_buffer.h
284:#define Xprintf_buffer_has_failed Xprintf (buffer_has_failed)
```

include/printf_buffer.h に定義・実装の両方があった。

```c
/* Returns true if the sticky error indicator of the buffer has been set to failed. */
static inline bool __attribute_warn_unused_result__
__printf_buffer_has_failed (struct __printf_buffer *buf)
{
  return buf->mode == __printf_buffer_mode_failed;
}
```

### \_\_printf_buffer_done() の実装

`__printf_buffer_flush_to_file()` はちょっと長いので、先にこっち。

```
$ rg 'Xprintf \(buffer_done\)'
include/printf_buffer.h
282:#define Xprintf_buffer_done Xprintf (buffer_done)
```

include/printf_buffer.h マクロ定義があった。
`Xprintf_buffer_done` で grep すると stdio-common/Xprintf_buffer_done.c がヒットする。

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

書き込みが成功しているかを確認し、成功していれば書き込んだバイト数を返す処理を行っていた。

### \_\_printf_buffer_flush_to_file() の実装

呼び元である、`__printf_buffer_to_file_done()` と同じファイル(stdio-common/printf_buffer_to_file.c)にある。

```c
void
__printf_buffer_flush_to_file (struct __printf_buffer_to_file *buf)
{
  /* The bytes in the buffer are always consumed.  */
  buf->base.written += buf->base.write_ptr - buf->base.write_base;

  if (buf->base.write_end == array_end (buf->stage))
    {
      /* If the stage buffer is used, make a copy into the file.
         The stage buffer is always consumed fully, even if just partially written, to ensure that the file stream has all the data. */
      size_t count = buf->base.write_ptr - buf->stage;
      if ((size_t) _IO_sputn (buf->fp, buf->stage, count) != count)
        {
          __printf_buffer_mark_failed (&buf->base);
          return;
        }
      /* buf->fp may have a buffer now.  */
      __printf_buffer_to_file_switch (buf);
      return;
    }
  else if (buf->base.write_end == buf->stage + 1)
    {
      /* Special one-character buffer case.  This is used to avoid flush-only overflow below. */
      if (buf->base.write_ptr == buf->base.write_end)
        {
          if (__overflow (buf->fp, (unsigned char) *buf->stage) == EOF)
            {
              __printf_buffer_mark_failed (&buf->base);
              return;
            }
          __printf_buffer_to_file_switch (buf);
        }
      /* Else there is nothing to write.  */
      return;
    }

  /* We have written directly into the buf->fp buffer.  */
  assert (buf->base.write_end == buf->fp->_IO_write_end);

  /* Mark the bytes as written.  */
  buf->fp->_IO_write_ptr = buf->base.write_ptr;

  if (buf->base.write_ptr == buf->base.write_end)
    {
      /* The buffer in buf->fp has been filled.
         This should just call __overflow (buf->fp, EOF), but flush-only overflow is obscure and not always correctly implemented. See bug 28949.
         Be conservative and switch to a one-character buffer instead, to obtain one more character for a regular __overflow call. */
      buf->base.write_ptr = buf->stage;
      buf->base.write_end = buf->stage + 1;
    }
  /* The bytes in the file stream were already marked as written above.  */

  buf->base.write_base = buf->base.write_ptr;
}
```

## 次の作業へのメモ

- `_IO_sputn` が何をしているのか
- `__overflow` が何をしているのか
- `__printf_buffer_mark_failed` が何をしているのか

`__printf_buffer_to_file_switch` を実験で確かめたけど、おそらく間違ってる。
なぜなら、`Xprintf_buffer_write()` 内の `Xprintf_buffer_flush()` により、`__printf_buffer_flush_to_file()` が呼ばれている。
↑に書いた通り、`__printf_buffer_flush_to_file()` では `write_ptr`, `write_end` が切り替わる処理が行われている。

以下にCopilot chat の解説を残す。

---

この関数`__printf_buffer_to_file_switch`は、printf関連のバッファリング機能の一部で、出力をファイルのバッファに切り替えるか、利用可能なバッファがない場合はステージングエリア（一時バッファ）を使用するように切り替える役割を持っています。以下は、この関数の動作のステップバイステップの説明です。

1. ファイルバッファが利用可能かチェックする: `buf->fp->_IO_write_ptr < buf->fp->_IO_write_end`を評価して、ファイルポインタの現在の書き込みポインタが書き込み終了位置よりも前にあるかどうかをチェックします。これは、ファイルバッファにまだ空きがあるかどうかを確認することに相当します。
1. ファイルバッファが利用可能な場合: ファイルバッファに空きがある場合、`buf->base.write_ptr`（現在の書き込みポインタ）と`buf->base.write_end`（書き込み終了位置）を、ファイルポインタのそれぞれの値に設定します。これにより、これからの書き込みが直接ファイルバッファに行われるようになります。
1. ファイルバッファが利用不可能な場合: ファイルバッファに空きがない場合、ステージングエリアを使用します。`buf->base.write_ptr`をステージングエリアの開始位置に、`buf->base.write_end`をステージングエリアの終端に設定します。これにより、これからの書き込みがステージングエリアに行われるようになります。
1. 書き込み基準位置の更新: 最後に、buf->base.write_base（書き込み基準位置）を現在の書き込みポインタ`buf->base.write_ptr`に設定します。これは、新しい書き込みの開始点を更新するためです。

この関数は、出力のバッファリング戦略を動的に切り替えることで、効率的なファイル書き込みを実現するためのものです。ファイルバッファが利用可能な場合はそれを優先し、そうでない場合は一時バッファ（ステージングエリア）を使用します。

---
