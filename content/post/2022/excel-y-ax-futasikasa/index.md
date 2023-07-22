---
title: "Excelで最小二乗法による直線y=axのaの不確かさを求める"
postdate: "2022-10-31T01:20"
update: "2022-10-31T01:47"
tags: ["Excel"]
---

y = ax の標準誤差は次のようにして求められるようである。

```txt
=INDEX(LINEST(既知のy, 既知のx, TRUE, TRUE), 2, 1)
```

標準誤差と不確かさは同じだってどこかで聞いた気がする。

基礎科学実験のレポートで上記方法を使い求めた値を不確かさとして提出したら、指摘されることなく通った。

参考: https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q14117841959
