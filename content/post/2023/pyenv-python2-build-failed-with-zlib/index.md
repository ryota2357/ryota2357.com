---
title: "pyenvでPython2.xのinstallに失敗した時の対処法(Missing the zlib)"
postdate: "2023-04-23T01:08"
update: "2023-04-23T01:08"
tags: ["Python"]
---

これ、

ERROR: The Python zlib extension was not compiled. Missing the zlib?

```
❯ pyenv install 2.7.18
python-build: use openssl@1.1 from homebrew
python-build: use readline from homebrew
Downloading Python-2.7.18.tar.xz...
-> https://www.python.org/ftp/python/2.7.18/Python-2.7.18.tar.xz
Installing Python-2.7.18...
patching file configure
patching file configure.ac
patching file setup.py
patching file 'Mac/Tools/pythonw.c'
patching file setup.py
patching file 'Doc/library/ctypes.rst'
patching file 'Lib/test/test_str.py'
patching file 'Lib/test/test_unicode.py'
patching file 'Modules/_ctypes/_ctypes.c'
patching file 'Modules/_ctypes/callproc.c'
patching file 'Modules/_ctypes/ctypes.h'
patching file 'Modules/_ctypes/callproc.c'
patching file setup.py
patching file 'Mac/Modules/qt/setup.py'
patching file setup.py
python-build: use readline from homebrew
python-build: use zlib from homebrew
Traceback (most recent call last):
  File "<string>", line 1, in <module>
ImportError: No module named zlib
ERROR: The Python zlib extension was not compiled. Missing the zlib?

Please consult to the Wiki page to fix the problem.
https://github.com/pyenv/pyenv/wiki/Common-build-problems


BUILD FAILED (OS X 13.3.1 using python-build 20180424)
```

エラーメッセージにある[ドキュメント](https://github.com/pyenv/pyenv/wiki/Common-build-problems)の方法に従って、

```sh
CPPFLAGS="-I$(brew --prefix zlib)/include" pyenv install 2.7.18
```

としても失敗した。

## 対処法

`zlib`は Homebrew で入れてること前提。

```sh
export CPPFLAGS="-I$(brew --prefix zlib)/include"
export LDFLAGS="-L$(brew --prefix zlib)/lib"
export PKG_CONFIG_PATH="$(brew --prefix zlib)/lib/pkgconfig"
```

`CPPFLAGS`だけじゃなくて`LDFLAGS`、`PKG_CONFIG_PATH`も指定する必要があるみたい。

## 参考

[Stack Overflow - The Python zlib extension was not compiled on Mac OS X 10.11.1](https://stackoverflow.com/questions/34200602/the-python-zlib-extension-was-not-compiled-on-mac-os-x-10-11-1)
