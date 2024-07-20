---
title: "glibcのprintf()の実装を読んでみる"
postdate: "2024-06-21T00:34"
update: "2024-06-21T00:34"
tags: ["C"]
---

大学の授業「コンピュータサイエンス実験 J4」にて、次の課題が出された。

> printf関数を用いたとき、実際にwriteシステム・コールがよばれて出力されるのはどの時点であるかを調べてみよ。標準出力が端末であるときと、たとえば「a.out > zzz」のようにリダイレクトにより標準出力がファイルになっているときとで違うのだろうか?

[Compiler Explor](https://godbolt.org/) で `printf` をコンパイルしても `call printf` としかならないので、ライブラリ本体をみる必要があるとわかった。
ソースコードは [https://ftp.gnu.org/gnu/glibc/](https://ftp.gnu.org/gnu/glibc/)より、[glibc-2.39.tar.gz](https://ftp.gnu.org/gnu/glibc/glibc-2.39.tar.gz)を取得し、展開する。

なお、この課題への回答はこの記事では行わない。この課題を行う上で printf の実装を読んだので、その記録である。

## まとめ

```
printf ── alias ──> __printf

1 __printf                                            (stdio-common/printf.c)
2     └── __vfprintf_internal                         (stdio-common/vfprintf-internal.c)
3         ├── __printf_buffer_to_file_init            (stdio-common/printf_buffer_to_file.c)
          │   ├── __printf_buffer_init                (include/printf_buffer.h)
          │   └── __printf_buffer_to_file_switch      (stdio-common/printf_buffer_to_file.c)
4         ├── Xprintf_buffer                          (stdio-common/vfprintf-internal.c)
5         └── __printf_buffer_to_file_done            (stdio-common/printf_buffer_to_file.c)
              ├── __printf_buffer_has_failed          (include/printf_buffer.h)
6             ├── __printf_buffer_flush_to_file       (stdio-common/printf_buffer_to_file.c)
              │   ├── __printf_buffer_mark_failed     (include/printf_buffer.h)
              │   ├── __overflow                      (libio/genops.c)
              │   │   └─ _IO_file_overflow            (libio/fileops.c)
              │   │       └─ 省略
              │   └── _IO_sputn                       (libio/fileops.c)
7             │       └─ _IO_new_file_xsputn          (libio/fileops.c)
8             │           └─ new_do_write             (libio/fileops.c)
              │               └─ _IO_new_file_write   (libio/fileops.c)
              │                   └─ __write          (write システムコールの weak name)
              └── __printf_buffer_done                (stdio-common/Xprintf_buffer_done.c)
```

**1: `__printf(const char *format, ...)`**

- `va_start()` と `va_end()` により可変長引数を処理し、`arg` とする。
- `__vfprintf_internal(stdout, format, arg, 0)` を呼び出す。

**2: `__vfprintf_internal(FILE *fp, const char *format, va_list ap, unsigned int mode_flags)`**

- 書き込むポインタやバッファなど情報を格納する ` struct __printf_buffer_to_file wrap;` を用意する。
- `__printf_buffer_to_file_init(&wrap, s);` で `wrap` を初期化。
- `Xprintf_buffer(&wrap.base, format, ap, mode_flags);` でバッファに書き込む。
- `__printf_buffer_to_file_done(&wrap);` で書き込み完了。

**3: `__printf_buffer_to_file_init(struct __printf_buffer_to_file *buf, FILE *fp)`**

- `__printf_buffer_init(&buf->base, buf->stage, array_length (buf->stage), __printf_buffer_mode_to_file);` で base バッファを初期化。
- `__printf_buffer_to_file_switch(buf);` で出力先のバッファを切り替える。

**4: `Xprintf_buffer(struct Xprintf_buffer *buf, const CHAR_T *format, va_list ap, unsigned int mode_flags)`**

- `printf()` の第一引数のフォーマット指定子(`format`)や、第二引数以降の値 (`ap`) を処理してそう。
- マクロや goto が入り乱れていて、読めなかった。

**5: `__printf_buffer_to_file_done(struct __printf_buffer_to_file *buf)`**

- `__printf_buffer_has_failed (&buf->base)` でバッファが問題ないかチェック。
- `__printf_buffer_flush_to_file(buf)` が stdio へ書き込みを行う実装の入り口。
- `__printf_buffer_done (&buf->base)` は書き込みが成功しているかを確認し、成功していれば書き込んだバイト数を返す。

**6: `__printf_buffer_flush_to_file (struct __printf_buffer_to_file *buf)`**

- `_IO_sputn (buf->fp, buf->stage, count)` で書き込みを行っている。

**7: `_IO_new_file_xsputn (FILE *f, const void *data, size_t n)`**

- `_IO_sputn(__f, __s, __n)` によりジャンプテーブルを利用して、呼び出される。
- ラインバッファリングの分岐をしたり、バッファサイズをレイアウトに合わせたりして、出力している。

**8: `new_do_write (FILE *fp, const char *data, size_t to_do)`**

- 書き込み処理と、ポインタの更新をしている。ポインタの更新の部分は今回読んでない。
- `_IO_SYSWRITE (fp, data, to_do)` はジャンプテーブルにより `_IO_new_file_write(fp, data, to_do)` があり、これが write システムコールを読んでいる。

## 探索

探索ログをまとめたものである。 整えはしたが少し読みづらいかもしてない。

### printf()の実装場所

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
# define vfprintf        __vfprintf_internal

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

次に調べるのは、`struct __printf_buffer_to_file`、`__printf_buffer_to_file_init()`、 `__printf_buffer_to_file_done()` にする。
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

続いて `__printf_buffer_to_file_switch()` をみると、構造体 `__printf_buffer_to_file` にあった `stage` フィールドは `write_ptr == write_end` の時に使われるもだったとわかる。

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

どのような時に `write_ptr == write_end` となるのかは分からないが、この関数は出力のバッファリング方法を切り替えるものだとわかった。

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
// 初期値は stdout の実装を見れば良さそうだけど、実行時に _IO_write_(ptr|end) は切り替わりそうなので、ここでは追わない。
if (stdout->_IO_write_ptr < stdout->_IO_write_end) {
    wrap.base.write_ptr = stdout->_IO_write_ptr;
    wrap.base.write_end = stdout->_IO_write_end;
} else {
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

`_IO_sputn()` で書き出したり、不正なものに対しては `__printf_buffer_mark_failed()` を読んでいるのがわかった。

`__overflow()` でコメントにある通り、特殊なバッファが 1 文字なケースなので、ここには書かない。
一応、`__overflow()` の実装の追跡をしたが `_IO_sputn()` と同じような流れだったので、知りたいときは `_IO_sputn()` のように追跡すれば良いだろう。

続いて、`__printf_buffer_mark_failed()`, `_IO_sputn()` の実装を探していく。

### \_\_printf_buffer_mark_failed() の実装

```
$ rg __printf_buffer_mark_failed
...
include/printf_buffer.h
105:__printf_buffer_mark_failed (struct __printf_buffer *buf)
...
```

ヘッダファイルに直接実装されていそうである。include/printf_buffer.h を開く。

```c
/* Marks the buffer as failed, so that __printf_buffer_has_failed returns true and future flush operations are no-ops. */
static inline void
__printf_buffer_mark_failed (struct __printf_buffer *buf)
{
  buf->mode = __printf_buffer_mode_failed;
}
```

### \_IO_sputn() の実装

```
$ rg _IO_sputn
...
libio/libioP.h
380:#define _IO_sputn(__fp, __s, __n) _IO_XSPUTN (__fp, __s, __n)
...
```

libio/libioP.h に別名が存在すると分かったので、開いて追っていく。

```c
// 380行目
#define _IO_sputn(__fp, __s, __n) _IO_XSPUTN (__fp, __s, __n)


// 177行目
#define _IO_XSPUTN(FP, DATA, N) JUMP2 (__xsputn, FP, DATA, N)


// 126行目
#define JUMP2(FUNC, THIS, X1, X2) (_IO_JUMPS_FUNC(THIS)->FUNC) (THIS, X1, X2)


// 117行目
#if _IO_JUMPS_OFFSET
# define _IO_JUMPS_FUNC(THIS) \
  (IO_validate_vtable                                                   \
   (*(struct _IO_jump_t **) ((void *) &_IO_JUMPS_FILE_plus (THIS)        \
                             + (THIS)->_vtable_offset)))
...
#else
# define _IO_JUMPS_FUNC(THIS) (IO_validate_vtable (_IO_JUMPS_FILE_plus (THIS)))


// 1022行目
/* Perform vtable pointer validation.  If validation fails, terminate the process.  */
static inline const struct _IO_jump_t *
IO_validate_vtable (const struct _IO_jump_t *vtable)
{
  uintptr_t ptr = (uintptr_t) vtable;
  uintptr_t offset = ptr - (uintptr_t) &__io_vtables;
  if (__glibc_unlikely (offset >= IO_VTABLES_LEN))
    /* The vtable pointer is not in the expected section.  Use the slow path, which will terminate the process if necessary. */
    _IO_vtable_check ();
  return vtable;
}


// 100行目
#define _IO_JUMPS_FILE_plus(THIS) \
  _IO_CAST_FIELD_ACCESS ((THIS), struct _IO_FILE_plus, vtable)


// 95行目
/* Essentially ((TYPE *) THIS)->MEMBER, but avoiding the aliasing violation in case THIS has a different pointer type.  */
#define _IO_CAST_FIELD_ACCESS(THIS, TYPE, MEMBER) \
  (*(_IO_MEMBER_TYPE (TYPE, MEMBER) *)(((char *) (THIS)) \
                                       + offsetof(TYPE, MEMBER)))


// 91行目
/* Type of MEMBER in struct type TYPE.  */
#define _IO_MEMBER_TYPE(TYPE, MEMBER) __typeof__ (((TYPE){}).MEMBER)
```

よくわからないので、マクロ展開してみる。(`_IO_JUMPS_OFFSET` は定義されていないとした。)

```c
_IO_sputn(__fp, __s, __n);
// ↓
IO_validate_vtable(
    *(__typeof__((struct _IO_FILE_plus {}).vtable)*)(
        ((char *)(__fp)) + offsetof(struct _IO_FILE_plus, vtable)
    )
)->__xsputn(__fp, __s, __n);
```

このマクロは `__fp` が指すオブジェクトの `vtable` を検証し、その `vtable` に定義された `__xsputn()` 関数を呼び出しているのだとわかった。

`_IO_sputn(buf->fp, ...)` と呼ばれていた。`buf-fp` は `stdout` であったので、`stdout` の実装を見れば良さそうである。

<details>
<summary> <code>__overflow()</code> も途中まで追跡したので折りたたんで置いておく。流れは <code>_IO_sputn()</code> と同じである。</summary>

```
$ rg __overflow -g '*.c'
...
libio/genops.c
198:__overflow (FILE *f, int ch)
205:libc_hidden_def (__overflow)
...
```

libio/genops.c を開く。

```c
int
__overflow (FILE *f, int ch)
{
  /* This is a single-byte stream.  */
  if (f->_mode == 0)
    _IO_fwide (f, -1);
  return _IO_OVERFLOW (f, ch);
}
libc_hidden_def (__overflow)

```

`f->mode` は `enum __printf_buffer_mode` である。`0` がどれかわからないので、実装を探すと次が見つかる。

```c
enum __printf_buffer_mode
  {
    __printf_buffer_mode_failed,
    __printf_buffer_mode_sprintf,
    __printf_buffer_mode_snprintf,
    __printf_buffer_mode_sprintf_chk,
    __printf_buffer_mode_to_file,
    __printf_buffer_mode_asprintf,
    __printf_buffer_mode_dprintf,
    __printf_buffer_mode_strfmon,
    __printf_buffer_mode_fp,         /* For __printf_fp_l_buffer.  */
    __printf_buffer_mode_fp_to_wide, /* For __wprintf_fp_l_buffer.  */
    __printf_buffer_mode_fphex_to_wide, /* For __wprintf_fphex_l_buffer.  */
    __printf_buffer_mode_obstack,    /* For __printf_buffer_flush_obstack.  */
  };
```

`0` は `__printf_buffer_mode_failed` だとわかった。この値はつい先ほど見た `__printf_buffer_mark_failed()` で設定されていたものだ。
それ以外の場合は、`__printf_buffer_to_file_init()` で設定した `__printf_buffer_mode_to_file` である。よって `_IO_fwide()` は呼ばれないと見ても問題ないであろう。

```
$ rg "define\ *_IO_OVERFLOW"
libio/libioP.h
147:#define _IO_OVERFLOW(FP, CH) JUMP1 (__overflow, FP, CH)
```

`_IO_OVERFLOW` は libioP.h にあり、 `JUMP1` のマクロとなっている。
このマクロを追うと `_IO_sputn` 同じような流れとなり、`vtable` 越しに `->__overflow` が呼ばれているとわかる。

</details>

### stdout の実装

```
$ rg stdout -g "*.h"
libio/stdio.h
150:extern FILE *stdout;                /* Standard output stream.  */
154:#define stdout stdout
```

libio/stdio.h に宣言されている。extern と define があるので、一応周辺を見てみる。

```c
/* Standard streams.  */
extern FILE *stdin;                /* Standard input stream.  */
extern FILE *stdout;                /* Standard output stream.  */
extern FILE *stderr;                /* Standard error output stream.  */
/* C89/C99 say they're macros.  Make them happy.  */
#define stdin stdin
#define stdout stdout
#define stderr stderr
```

C89/C99 への対応のための `#define` だとわかった。extern の実態を探す。

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

`_IO_MTSAFE_IO` はおそらくマルチスレッド対応であろう。今回は簡単のためシングルスレッドであるとして進めていく (つまり `_IO_MTSAFE_IO` が定義されていないとする)。

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
#  define FILEBUF_LITERAL(CHAIN, FLAGS, FD, WDP) \
       { _IO_MAGIC+_IO_LINKED+_IO_IS_FILEBUF+FLAGS, \
         0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, (FILE *) CHAIN, FD, \
         0, _IO_pos_BAD, 0, 0, { 0 }, 0, _IO_pos_BAD, \
         NULL, WDP, 0 }
```

`stdout` の実装をまとめると次だとわかった。

```c
FILE *stdout = (FILE *) &_IO_2_1_stdout_;

DEF_STDFILE(_IO_2_1_stdin_, 0, 0, _IO_NO_WRITES);
static struct _IO_wide_data _IO_wide_data_1 = { ._wide_vtable = &_IO_wfile_jumps };
struct _IO_FILE_plus _IO_2_1_stdout_ = {
    .file = {
        _IO_MAGIC + _IO_LINKED + _IO_IS_FILEBUF + _IO_NO_READS,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, (FILE *)&_IO_2_1_stdin_, 1,
        0, _IO_pos_BAD, 0, 0, {0}, 0, _IO_pos_BAD,
        NULL, &_IO_wide_data_1, 0
    },
    .vtable = &_IO_file_jumps
};
```

さて、`_IO_sputn()`, `__overflow()` で重要となるのは `.vtable` の `&_IO_file_jumps` である。この定義は libio/libioP.h にある。

```c
enum
{
  IO_STR_JUMPS                    = 0,
  IO_WSTR_JUMPS                   = 1,
  IO_FILE_JUMPS                   = 2,
  ...
};
#define IO_VTABLES_LEN (IO_VTABLES_NUM * sizeof (struct _IO_jump_t))

extern const struct _IO_jump_t __io_vtables[] attribute_hidden;
#define _IO_str_jumps                    (__io_vtables[IO_STR_JUMPS])
#define _IO_wstr_jumps                   (__io_vtables[IO_WSTR_JUMPS])
#define _IO_file_jumps                   (__io_vtables[IO_FILE_JUMPS])
```

続いて、`__io_vtables[IO_FILE_JUMPS]` は `rg -g "*.c" "__io_vtables"` をすると、libio/vtables.c にあるとわかる。

```c
const struct _IO_jump_t __io_vtables[] attribute_relro =
{
  ...
  /* _IO_file_jumps  */
  [IO_FILE_JUMPS] = {
    JUMP_INIT_DUMMY,
    JUMP_INIT (finish, _IO_file_finish),
    JUMP_INIT (overflow, _IO_file_overflow),
    JUMP_INIT (underflow, _IO_file_underflow),
    JUMP_INIT (uflow, _IO_default_uflow),
    JUMP_INIT (pbackfail, _IO_default_pbackfail),
    JUMP_INIT (xsputn, _IO_file_xsputn),
    JUMP_INIT (xsgetn, _IO_file_xsgetn),
    JUMP_INIT (seekoff, _IO_new_file_seekoff),
    JUMP_INIT (seekpos, _IO_default_seekpos),
    JUMP_INIT (setbuf, _IO_new_file_setbuf),
    JUMP_INIT (sync, _IO_new_file_sync),
    JUMP_INIT (doallocate, _IO_file_doallocate),
    JUMP_INIT (read, _IO_file_read),
    JUMP_INIT (write, _IO_new_file_write),
    JUMP_INIT (seek, _IO_file_seek),
    JUMP_INIT (close, _IO_file_close),
    JUMP_INIT (stat, _IO_file_stat),
    JUMP_INIT (showmanyc, _IO_default_showmanyc),
    JUMP_INIT (imbue, _IO_default_imbue)
  },
  ...
```

`JUMP_INIT` は libio/libioP.h にあって、`#define JUMP_INIT(NAME, VALUE) VALUE` なので、可読性のためだけにあるマクロであろう。
探していたのは `->__xsputn` と `->__overflow` は `_IO_file_xsputn`, `_IO_file_overflow` だと予測できる。

### \_IO_file_xsputn （\_IO_sputn() の実装）

```
$ rg -g "*.h" _IO_file_xsputn
libio/libioP.h
598:extern size_t _IO_file_xsputn (FILE *, const void *, size_t);
599:libc_hidden_proto (_IO_file_xsputn)

$ rg -g "*.c" _IO_new_file_xsputn
libio/fileops.c
1197:_IO_new_file_xsputn (FILE *f, const void *data, size_t n)
1269:libc_hidden_ver (_IO_new_file_xsputn, _IO_file_xsputn)
1431:versioned_symbol (libc, _IO_new_file_xsputn, _IO_file_xsputn, GLIBC_2_1);
...
```

より、libio/fileops.c に `_IO_new_file_xsputn()` として実装されているとわかった。

```c
size_t
_IO_new_file_xsputn (FILE *f, const void *data, size_t n)
{
  const char *s = (const char *) data;
  size_t to_do = n;
  int must_flush = 0;
  size_t count = 0;

  if (n <= 0)
    return 0;
  /* This is an optimized implementation.
     If the amount to be written straddles a block boundary (or the filebuf is unbuffered), use sys_write directly. */

  /* First figure out how much space is available in the buffer. */
  if ((f->_flags & _IO_LINE_BUF) && (f->_flags & _IO_CURRENTLY_PUTTING))
    {
      count = f->_IO_buf_end - f->_IO_write_ptr;
      if (count >= n)
        {
          const char *p;
          for (p = s + n; p > s; )
            {
              if (*--p == '\n')
                {
                  count = p - s + 1;
                  must_flush = 1;
                  break;
                }
            }
        }
    }
  else if (f->_IO_write_end > f->_IO_write_ptr)
    count = f->_IO_write_end - f->_IO_write_ptr; /* Space available. */

  /* Then fill the buffer. */
  if (count > 0)
    {
      if (count > to_do)
        count = to_do;
      f->_IO_write_ptr = __mempcpy (f->_IO_write_ptr, s, count);
      s += count;
      to_do -= count;
    }
  if (to_do + must_flush > 0)
    {
      size_t block_size, do_write;
      /* Next flush the (full) buffer. */
      if (_IO_OVERFLOW (f, EOF) == EOF)
        /* If nothing else has to be written we must not signal the caller that everything has been written.  */
        return to_do == 0 ? EOF : n - to_do;

      /* Try to maintain alignment: write a whole number of blocks.  */
      block_size = f->_IO_buf_end - f->_IO_buf_base;
      do_write = to_do - (block_size >= 128 ? to_do % block_size : 0);

      if (do_write)
        {
          count = new_do_write (f, s, do_write);
          to_do -= count;
          if (count < do_write)
            return n - to_do;
        }

      /* Now write out the remainder.
         Normally, this will fit in the buffer, but it's somewhat messier for line-buffered files, so we let _IO_default_xsputn handle the general case. */
      if (to_do)
        to_do -= _IO_default_xsputn (f, s+do_write, to_do);
    }
  return n - to_do;
}
```

少し長いが、コメントが丁寧なのでわかりやすい。
まず、 `f` のバッファ内の利用可能なサイズを計算する。この時ラインバッファリングかどうかも見ている。そして、そのサイズ分の書き込んでいる(`__mempcpy`)。
バッファ内のデータが全て書き込めたなら EOF を返し、そうでないなら `new_do_write()` を呼び出している。

`new_do_write()` は同ファイル (libio/fileops.c) にある。

```c
static size_t
new_do_write (FILE *fp, const char *data, size_t to_do)
{
  size_t count;
  if (fp->_flags & _IO_IS_APPENDING)
    /* On a system without a proper O_APPEND implementation, you would need to sys_seek(0, SEEK_END) here, but is not needed nor desirable for Unix- or Posix-like systems.
       Instead, just indicate that offset (before and after) is unpredictable. */
    fp->_offset = _IO_pos_BAD;
  else if (fp->_IO_read_end != fp->_IO_write_base)
    {
      off64_t new_pos
        = _IO_SYSSEEK (fp, fp->_IO_write_base - fp->_IO_read_end, 1);
      if (new_pos == _IO_pos_BAD)
        return 0;
      fp->_offset = new_pos;
    }
  count = _IO_SYSWRITE (fp, data, to_do);
  if (fp->_cur_column && count)
    fp->_cur_column = _IO_adjust_column (fp->_cur_column - 1, data, count) + 1;
  _IO_setg (fp, fp->_IO_buf_base, fp->_IO_buf_base, fp->_IO_buf_base);
  fp->_IO_write_base = fp->_IO_write_ptr = fp->_IO_buf_base;
  fp->_IO_write_end = (fp->_mode <= 0
                       && (fp->_flags & (_IO_LINE_BUF | _IO_UNBUFFERED))
                       ? fp->_IO_buf_base : fp->_IO_buf_end);
  return count;
}
```

実装は短いが複雑である。書き込みを行っていそうなのは名前からして `_IO_SYSWRITE` であろう。
seek とかポインタの更新は今回読まない。

`_IO_SYSWRITE` は `_IO_sputn` と同じようなマクロで、`stdout` に対しては `_IO_new_file_write()` (libio/fileops.c) を呼び出しているものとなる。

```c
ssize_t
_IO_new_file_write (FILE *f, const void *data, ssize_t n)
{
  ssize_t to_do = n;
  while (to_do > 0)
    {
      ssize_t count = (__builtin_expect (f->_flags2
                                         & _IO_FLAGS2_NOTCANCEL, 0)
                           ? __write_nocancel (f->_fileno, data, to_do)
                           : __write (f->_fileno, data, to_do));
      if (count < 0)
        {
          f->_flags |= _IO_ERR_SEEN;
          break;
        }
      to_do -= count;
      data = (void *) ((char *) data + count);
    }
  n -= to_do;
  if (f->_offset >= 0)
    f->_offset += n;
  return n;
}
```

`__write_nocancel()` は rg すると `__write` に `#define` されていたり、 weak_alias となっていたりするので、`__wirte` と思っていいだろう。

`__write` は sysdeps/unix/syscalls.list に次のようにある。

```
...
# File name     Caller  Syscall name    Args    Strong name     Weak names
...
write           -       write           Ci:ibU  __libc_write    __write write
writev          -       writev          Ci:ipi  __writev        writev
```

`__write` は write システムコールだとわかった。

ここまで、`printf()` から write システムコールが呼ばれるまでの流れを探索できたので終了とする。
