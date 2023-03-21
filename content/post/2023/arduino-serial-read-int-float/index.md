---
title: "Arduinoでシリアルモニタから数値(整数と小数)を受け取る"
postdate: "2023-03-22T01:51"
update: "2023-03-22T01:51"
tags: ["Arduino"]
---

`Serial`から数値を読む用のユーティリティクラス`SerialReader`を作った。`SerialReader::readInt()`で`int`を`SerialReader::readFloat()`で`float`を読み出せる。

`readFloat()`は急いで作ったのでちょっと雑な作りしてるけどちゃんと動く。

```cpp
class SerialReader
{
  public:
    explicit constexpr SerialReader() {}
    int readInt() const {
        char buf[40] = {0};
        wait_();
        int ret = 0;
        int size = min(40, Serial.available());
        for (int i = 0; i < size; ++i) {
            buf[i] = (char)Serial.read();
        }
        int now = 0;
        char c = buf[now];
        while ((c < '0' || '9' < c) && c != '-') {
            c = buf[++now];
        }
        const bool f = (c == '-') && (c = buf[++now]);
        while (now + 1 < size) {
            ret = 10 * ret + c - '0';
            c = buf[++now];
        }
        return f ? -ret : ret;
    }

    float readFloat() const {
        char buf[40] = {0};
        wait_();
        int size = min(40, Serial.available());
        for (int i = 0; i < size; ++i) {
            buf[i] = (char)Serial.read();
        }
        int dot_idx = size - 1;
        for (int i = 0; i < size; ++i) {
            if (buf[i] == '.') {
                dot_idx = i;
                break;
            }
        }
        float ret = 0;
        float e = pow(10, dot_idx - 1);
        int now = 0;
        char c = buf[now];
        const bool f = (buf[now] == '-') && (c = buf[++now], e /= 10);
        while (now + 1 < size) {
            if (c != '.') {
                ret += (c - '0') * e;
                e /= 10;
            }
            c = buf[++now];
        }
        return f ? -ret : ret;
    }

  private:
    void wait_() const {
        while (Serial.available() == 0) {
            ;
        }
        delay(50);
    }
};
```

## 説明

まず、`Serial.read()`で読み取れるのは文字コード、つまり`char`である。なので実装としては`char[]`を数値に変換するだけである。
`SerialReader`では`char buf[40] = {0}`として、この配列に文字を格納し、それを数値に変換している。

1 つ実装する際に注意しなければならない点として private メソッドの`wait_()`にて行っている`delay(50)`がある。
`Serial.available()`が 0 以上になった時、シリアルモニタにて入力された文字列全てが`Serial`のバッファに格納されているわけではない。全て格納されるには少し待つ必要がある。
そのため`delay(50)`を行い、シリアルモニタの入力が全て送られてくるのを待つ必要がある。(実際には 50ms も待つ必要はなく、もっと短い時間で十分である)

`readInt()`、`readFloat()`の実装については複雑なことはせず、単純に数値変換しているだけなのでコードを読めばわかると思うので省略する。
ちなみに、`readInt()`は僕が競技プログラミングにて用いている`read<T>()`関数をベースにした。

```cpp
template <class T = int>
inline T read(void) {
    T ret = 0;
    char c = getchar();
    while ((c < '0' || '9' < c) && c != '-') c = getchar();
    const bool f = (c == '-') && (c = getchar());
    while ('0' <= c && c <= '9') {
        ret = 10 * ret + c - '0';
        c = getchar();
    }
    return f ? -ret : ret;
}
```

## サンプル

```cpp
constexpr SerialReader Reader;

void setup() {
    do {
        Serial.begin(9600);
    } while (!Serial);
    Serial.println("Open Serial(9600)");
}

void loop() {
    const int value = Reader.readInt();
    // const float value = Reader.readFloat();
    Serial.println(value);
}
```
