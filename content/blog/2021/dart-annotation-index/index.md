---
title: "[Dart] meta.dart アノテーション一覧"
postdate: "2021-08-09T21:45"
update: "2021-08-09T21:45"
tags: ["Dart"]
---

Dart 公式の meta.dart と dart:core ライブラリに定義されているアノテーションの一覧が欲しかったので作った。

日本語はかなりざっくり書いているので、原文ドキュメントを読むことも推奨。

[sdk/pkg/analysis_server/test/mock_packages/meta/lib/meta.dart](https://github.com/dart-lang/sdk/blob/5208456b5af83120d0cb21c6a2a4d2f07e9c89e6/pkg/analysis_server/test/mock_packages/meta/lib/meta.dart)

### @deprecated

```dart
@Deprecated('message')
```

を使用することが推奨されている。[provide_deprecation_message](https://dart-lang.github.io/linter/lints/provide_deprecation_message.html)

<details>
  <summary>ドキュメント</summary>
Create a deprecation annotation which specifies the migration path and expiration of the annotated feature.
The message argument should be readable by programmers, and should state an alternative feature (if available) as well as when an annotated feature is expected to be removed
</details>

非推奨のもの(今後削除されるもの)について警告を出す。  
引数のメッセージで補足や、代替機能を促したりすると良い。

### @override

<details>
  <summary>ドキュメント</summary>
Annotation on an instance members which override an interface member.
Annotations have no effect on the meaning of a Dart program. This annotation is recognized by the Dart analyzer, and it allows the analyzer to provide hints or warnings for some potential problems of an otherwise valid program. As such, the meaning of this annotation is defined by the Dart analyzer.
The @override annotation expresses the intent that a declaration should override an interface method, something which is not visible from the declaration itself. This extra information allows the analyzer to provide a warning when that intent is not satisfied, where a member is intended to override a superclass member or implement an interface member, but fails to do so. Such a situation can arise if a member name is mistyped, or if the superclass renames the member.
The @override annotation applies to instance methods, instance getters, instance setters and instance variables (fields). When applied to an instance variable, it means that the variable's implicit getter and setter (if any) are marked as overriding. It has no effect on the variable itself.
Further lints  can be used to enable more warnings based on @override annotations.
</details>

インターフェースメンバをオーバーライドすることを示す。  
親に存在しないメンバをオーバーライドしようとした時(typo とか)に警告を出してくれる。  
このアノテーションにより、オーバーライドできていることをアナライザーが保証してくれる。

### @alwaysThrows

詳しくはドキュメント読んで。

<details>
  <summary>ドキュメント</summary>
Used to annotate a function f. Indicates that f always throws an exception. Any functions that override f, in class inheritance, are also expected to conform to this contract.
Tools, such as the analyzer, can use this to understand whether a block of code "exits". For example:

```dart
@alwaysThrows toss() { throw 'Thrown'; }

int fn(bool b) {
  if (b) {
    return 0;
  } else {
    toss();
    print("Hello.");
  }
}
```

<!-- textlint-disable ja-technical-writing/sentence-length -->

Without the annotation on toss, it would look as though fn doesn't always return a value. The annotation shows that fn does always exit. In addition, the annotation reveals that any statements following a call to toss (like the print call) are dead code.
Tools, such as the analyzer, can also expect this contract to be enforced; that is, tools may emit warnings if a function with this annotation doesn't always throw.

<!-- textlint-enable ja-technical-writing/sentence-length -->

</details>

常に例外を投げる関数(メソッド)につける。  
つまりこの関数を呼び出した後の記述は実行されなくなる。アナライザーはそれを検知し、警告を発する。

### @checked

よくわからなかったので DeepL 翻訳そのまま。

<details>
  <summary>ドキュメント</summary>
Used to annotate a parameter of an instance method that overrides another method.
Indicates that this parameter may have a tighter type than the parameter on its superclass. The actual argument will be checked at runtime to ensure it is a subtype of the overridden parameter type.
</details>

別のメソッドをオーバーライドするインスタンスメソッドのパラメータに注釈を付けるために使用します。
このパラメータは、そのスーパークラスのパラメータよりも厳しい型を持つ可能性があることを示します。実際の引数は、オーバーライドされたパラメータ型のサブタイプであることを確認するために、実行時にチェックされます。

### @experimental

<details>
  <summary>ドキュメント</summary>
Used to annotate a library, or any declaration that is part of the public interface of a library (such as top-level members, class members, and function parameters) to indicate that the annotated API is experimental and may be removed or changed at any-time without updating the version of the containing package, despite the fact that it would otherwise be a breaking change.
If the annotation is applied to a library then it is equivalent to applying the annotation to all of the top-level members of the library. Applying the annotation to a class does not apply the annotation to subclasses, but does apply the annotation to members of the class.
Tools, such as the analyzer, can provide feedback if
the annotation is associated with a declaration that is not part of the public interface of a library (such as a local variable or a declaration that is private) or a directive other than the first directive in the library, or
the declaration is referenced by a package that has not explicitly indicated its intention to use experimental APIs (details TBD).
</details>

アノテーションをつけた API は実験的(experimental)であることを示す。

クラスにつけた場合はそのメンバも、ライブラリにつけるとライブラリ内のトップレベルメンバ全てにこのアノテーションをつけたことと同じになる。  
サブクラスは親にアノテーションがついていても適用されない。

### @factory

<details>
  <summary>ドキュメント</summary>
Used to annotate an instance or static method m. Indicates that m must either be abstract or must return a newly allocated object or null. In addition, every method that either implements or overrides m is implicitly annotated with this same annotation.
Tools, such as the analyzer, can provide feedback if
the annotation is associated with anything other than a method, or
a method that has this annotation can return anything other than a newly allocated object or `null`.
</details>

ファクトリメソッドにつける。  
新しく割り当てられたオブジェクトか `null` を返すことを示す。

### @immutable

<details>
  <summary>ドキュメント</summary>
Used to annotate a class C. Indicates that C and all subtypes of C must be immutable.
A class is immutable if all of the instance fields of the class, whether defined directly or inherited, are final.
Tools, such as the analyzer, can provide feedback if
the annotation is associated with anything other than a class, or
a class that has this annotation or extends, implements or mixes in a class that has this annotation is not immutable.
</details>

イミュータブルなクラスにつける。  
もしイミュータブルになっていなければ警告される。

### @isTest

DeepL 翻訳そのまま。

<details>
  <summary>ドキュメント</summary>
Used to annotate a test framework function that runs a single test.
Tools, such as IDEs, can show invocations of such function in a file structure view to help the user navigating in large test files.
The first parameter of the function must be the description of the test.
</details>

1 つのテストを実行するテストフレームワーク関数に注釈を付けるために使用します。
IDE などのツールでは、このような関数の呼び出しをファイル構造ビューに表示して、ユーザーが大きなテストファイルの中を移動するのを助けることができます。
この関数の最初のパラメータには、テストの説明を指定します。

### @isTestGroup

DeepL 翻訳そのまま。

<details>
  <summary>ドキュメント</summary>
Used to annotate a test framework function that runs a group of tests.
Tools, such as IDEs, can show invocations of such function in a file structure view to help the user navigating in large test files.
The first parameter of the function must be the description of the group.
</details>

一連のテストを実行するテスト フレームワーク関数に注釈を付けるために使用します。
IDE などのツールでは、このような関数の呼び出しをファイル構造ビューに表示でき、ユーザーが大きなテストファイルの中をナビゲートするのに役立ちます。
この関数の最初のパラメータには、グループの説明を指定します。

### @literal

<details>
  <summary>ドキュメント</summary>
Used to annotate a const constructor c. Indicates that any invocation of the constructor must use the keyword const unless one or more of the arguments to the constructor is not a compile-time constant.
Tools, such as the analyzer, can provide feedback if
the annotation is associated with anything other than a const constructor, or
an invocation of a constructor that has this annotation is not invoked using the `const` keyword unless one or more of the arguments to the constructor is not a compile-time constant.
</details>

コンストラクタの引数のうち 1 つ以上がコンパイル時の定数でない場合を除き、コンストラクタの呼び出しにはキーワード `const` を使用しなければならないことを示す。

### @mustCallSuper

<details>
  <summary>ドキュメント</summary>
Used to annotate an instance method m. Indicates that every invocation of a method that overrides m must also invoke m. In addition, every method that overrides m is implicitly annotated with this same annotation.
Note that private methods with this annotation cannot be validly overridden outside of the library that defines the annotated method.
Tools, such as the analyzer, can provide feedback if
the annotation is associated with anything other than an instance method, or
a method that overrides a method that has this annotation can return without invoking the overridden method.
</details>

メソッド m をオーバーライドした時、その親のメソッド m も呼び出す必要があることを示す。 またメソッド m はオーバーライドされたとしても、暗黙的にこのアノテーションがつけられる。

### @optionalTypeArgs

<details>
  <summary>ドキュメント</summary>
Used to annotate a class, mixin, extension, function, method, or typedef declaration C. Indicates that any type arguments declared on C are to be treated as optional.
Tools such as the analyzer and linter can use this information to suppress warnings that would otherwise require type arguments on C to be provided.
</details>

宣言された引数が全てオプションであることを示す。

### @protected

<details>
  <summary>ドキュメント</summary>
Used to annotate an instance member in a class or mixin which is meant to be visible only within the declaring library, and to other instance members of the class or mixin, and their subtypes.
If the annotation is on a field it applies to the getter, and setter if appropriate, that are induced by the field.
Indicates that the annotated instance member (method, getter, setter, operator, or field) m in a class or mixin C should only be referenced in specific locations. A reference from within the library in which C is declared is valid. Additionally, a reference from within an instance member in C, or a class that extends, implements, or mixes in C (either directly or indirectly) or a mixin that uses C as a superclass constraint is valid. Additionally a reference from within an instance member in an extension that applies to C is valid.
Additionally restricts the instance of C on which m is referenced: a reference to m should either be in the same library in which C is declared, or should refer to this.m (explicitly or implicitly), and not m on any other instance of C.
Tools, such as the analyzer, can provide feedback if
the annotation is associated with anything other than an instance member, or
a reference to a member `m` which has this annotation, declared in a class or mixin `C`, is found outside of the declaring library and outside of an instance member in any class that extends, implements, or mixes in `C` or any mixin that uses `C` as a superclass constraint, or
a reference to a member `m` which has this annotation, declared in a class or mixin `C`, is found outside of the declaring library and the receiver is something other than `this`.
</details>

アノテーションのつけられたメンバはサブクラスとライブラリ内のみ表示されるようになる。  
上記以外でそのメンバが呼ばれた時はアナライザーが警告する。

### @required

<details>
  <summary>ドキュメント</summary>
Used to annotate a named parameter p in a method or function f. Indicates that every invocation of f must include an argument corresponding to p, despite the fact that p would otherwise be an optional parameter.
Tools, such as the analyzer, can provide feedback if
the annotation is associated with anything other than a named parameter,
the annotation is associated with a named parameter in a method `m1` that overrides a method `m0` and `m0` defines a named parameter with the same name that does not have this annotation, or
an invocation of a method or function does not include an argument corresponding to a named parameter that has this annotation.
</details>

多分、`required` 修飾子と同じ。  
パラメータが必須であることを示し、呼び元でそのパラメータが指定されていないなら警告する。

### @sealed

<details>
  <summary>ドキュメント</summary>
Annotation marking a class as not allowed as a super-type.
Classes in the same package as the marked class may extend, implement or mix-in the annotated class.
Tools, such as the analyzer, can provide feedback if
the annotation is associated with anything other than a class,
the annotation is associated with a class `C`, and there is a class or mixin `D`, which extends, implements, mixes in, or constrains to `C`, and `C` and `D` are declared in different packages.
</details>

アノテーションをつけたクラスはスーパークラスとして使うことを許可しないことを示す。

### @virtual

<details>
  <summary>ドキュメント</summary>
Used to annotate a field that is allowed to be overridden in Strong Mode.
Deprecated: Most of strong mode is now the default in 2.0, but the notion of virtual fields was dropped, so this annotation no longer has any meaning. Uses of the annotation should be removed.
</details>

非推奨。
Dart2.0 でデフォルトになったので。

### @visibleForOverriding

<details>
  <summary>ドキュメント</summary>
Used to annotate an instance member that was made public so that it could be overridden but that is not intended to be referenced from outside the defining library.
Tools, such as the analyzer, can provide feedback if
the annotation is associated with a declaration other than a public instance member in a class or mixin, or
the member is referenced outside of the defining library.
</details>

アノテーションをつけたインスタンスメンバーはオーバーライドできるように公開されているが、定義しているライブラリの外部から参照されることを意図していないことを示す。

### @visibleForTesting

<details>
  <summary>ドキュメント</summary>
Used to annotate a declaration that was made public, so that it is more visible than otherwise necessary, to make code testable.
Tools, such as the analyzer, can provide feedback if
the annotation is associated with a declaration not in the `lib` folder of a package, or a private declaration, or a declaration in an unnamed static extension, or
the declaration is referenced outside of its defining library or a library which is in the `test` folder of the defining package.
</details>

テスト用のコードであることを示し、test フォルダ下以外で呼ばれると警告を出す。
