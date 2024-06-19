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

余談だが、macOS で clangd の定義ジャンプすると /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk/usr/include/stdio.h に `printf` の定義は見つかる。
そこからは僕は何も `printf` の実装に関する情報を掴めなかったので、glibc をみることとなった。

## printf()の実装場所の探索

`find . -name "*printf*"` を打ってみると `printf.c` という、そのまんまなファイルがあることがわかった。

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

`strong_alias` というのがあることがわかる。これを目印に探すと、include/libc-symbols.h に行き着いた。

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

stdio-common/vfprintf-internal.c が名前から怪しい。開いてみると実装があった。
処理の流れがわかるように、引数チェックや IO ロック部分を削除すると次のようになる。

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

`Xprintf_buffer()` は ↑ と同じファイル(stdio-common/vfprintf-internal.c)にあり、この関数がバッファへの書き込みを行っているようである。
マクロが入り乱れ、処理も複雑そうであるため、

構造体 `__printf_buffer_to_file` と関数 `__printf_buffer_to_file_*` ついて調べていく。

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

構造体 `__printf_buffer_to_file`, `__printf_buffer` のフィールドに関して疑問を持つところはない。コメントに記されている通り、出力に必要なデータを持っていることがわかった。

## 関数 \_\_printf_buffer_to_file\_\*()

```
$ rg "__printf_buffer_to_file_init"
...
stdio-common/printf_buffer_to_file.c
107:__printf_buffer_to_file_init (struct __printf_buffer_to_file *buf, FILE *fp)
...
```

stdio-common/printf_buffer_to_file.c に `__printf_buffer_init()`, `__printf_buffer_done()` の両方の実装がある。

```c
void
__printf_buffer_to_file_init (struct __printf_buffer_to_file *buf, FILE *fp)
{
  __printf_buffer_init (&buf->base, buf->stage, array_length (buf->stage),
                        __printf_buffer_mode_to_file);
  buf->fp = fp;
  __printf_buffer_to_file_switch (buf);
}

int
__printf_buffer_to_file_done (struct __printf_buffer_to_file *buf)
{
  if (__printf_buffer_has_failed (&buf->base))
    return -1;
  __printf_buffer_flush_to_file (buf);
  return __printf_buffer_done (&buf->base);
}
```

### \_\_printf_buffer_init()

バッファの初期化に関しては `__printf_buffer_init()` が行っているようである。
`__printf_buffer_to_file_switch()` は同じファイル内にあり、次の通りである。

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

コメントに書いてある通りの処理が実装されている。
構造体 `__printf_buffer_to_file` にあった `stage` フィールドは write_ptr == write_end の時に使われるもだったとわかった。

`__printf_buffer_init()` は include/printf_buffer.h にある。

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

フィールドをただ初期化しているだけだった。

### \_\_printf_buffer_done()

メモ

- `__printf_buffer_flush_to_file()` (stdio-common/printf_buffer_to_file.c にある) は色々やってる。
- `__printf_buffer_has_failed()`, `__printf_buffer_done()` は実装が見つけられない。
