---
title: "[Unity] Quaternion.AngleAxis について簡潔に"
postdate: "2022-05-07T15:14"
tags: ["Unity"]
---

知りたい情報を得るのに時間がかかったので。

## 定義

ベクトル `axis` を回転軸として、`angle` 度回転する、回転(Quaternion)を作成する。

```cs
public static Quaternion AngleAxis (float angle, Vector3 axis);
```

### 補足

- 回転軸 `axis` は自動で正規化されるので、単位ベクトルを指定する必要はない
  - 作成された Quaternion によって、スケーリングされることはない
- 回転角 `angle` は度数法で指定する
- 回転の方向は transform の rotation と同じ、右ねじ

## 使い方の例

次のスクリプトを Cube とかにアタッチすると、よくわかると思う。

```cs
using UnityEngine;

public class Example : MonoBehaviour
{
     [SerializeField] private Vector3 axis;
     [SerializeField] private float angle;

     private Quaternion startAngle;

     private void Start()
     {
          startAngle = this.gameObject.transform.rotation;
     }

     private void Update()
     {
          this.gameObject.transform.rotation
               = Quaternion.AngleAxis(this.angle, this.axis) * startAngle;
     }
}
```

## 参考

[Unity スクリプトリファレンス Quaternion.AngleAxis](https://docs.unity3d.com/ja/current/ScriptReference/Quaternion.AngleAxis.html)
