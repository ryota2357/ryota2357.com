---
title: "[Dart]エラー・例外一覧"
postdate: "2021-05-29T09:23"
update: "2021-05-29T09:23"
tags: ["Dart"]
---

dart SKD のエラー・例外の一覧がなかったので。
[https://api.dart.dev/stable/2.13.1/index.html](https://api.dart.dev/stable/2.13.1/index.html)

<details>
  <summary>エラーと例外の違い</summary>

> Dart には Exception と Error の型があり、また数多くのあらかじめ定義されたそれらの副型がある。無論自分自身の例外を定義することも可能である。しかしながら、Dart のプログラムは非 null オブジェクト（単に Exception と Error のオブジェクトでなく）を例外としてスローし得る。Error と Exception に関しては、基本的に Error とそのサブクラスはプログラム・エラーであり、そのプログラムは修正が必要である。一方非エラーの Exception は実行時エラーである。これは通常プログラムであらかじめスローされるのを防止出来ない。  
> [Dart 2 Language Guide](https://www.cresc.co.jp/tech/java/Google_Dart2/language/exceptions/exceptions.html)

</details>

## 例外

### CertificateException

An exception that happens in the handshake phase of establishing a secure network connection, when looking up or verifying a certificate.

[https://api.dart.dev/stable/2.13.1/dart-io/CertificateException-class.html](https://api.dart.dev/stable/2.13.1/dart-io/CertificateException-class.html)

### DeferredLoadException

Thrown when a deferred library fails to load.

[https://api.dart.dev/stable/2.13.1/dart-async/DeferredLoadException-class.html](https://api.dart.dev/stable/2.13.1/dart-async/DeferredLoadException-class.html)

### FileSystemException

Exception thrown when a file operation fails.

[https://api.dart.dev/stable/2.13.1/dart-io/FileSystemException-class.html](https://api.dart.dev/stable/2.13.1/dart-io/FileSystemException-class.html)

### FormatException

Exception thrown when a string or some other data does not have an expected format and cannot be parsed or processed.

[https://api.dart.dev/stable/2.13.1/dart-core/FormatException-class.html](https://api.dart.dev/stable/2.13.1/dart-core/FormatException-class.html)

### HandshakeException

An exception that happens in the handshake phase of establishing a secure network connection.

[https://api.dart.dev/stable/2.13.1/dart-io/HandshakeException-class.html](https://api.dart.dev/stable/2.13.1/dart-io/HandshakeException-class.html)

### HttpException

[https://api.dart.dev/stable/2.13.1/dart-io/HttpException-class.html](https://api.dart.dev/stable/2.13.1/dart-io/HttpException-class.html)

### IntegerDivisionByZeroException

[https://api.dart.dev/stable/2.13.1/dart-core/IntegerDivisionByZeroException-class.html](https://api.dart.dev/stable/2.13.1/dart-core/IntegerDivisionByZeroException-class.html)

### IOException

Base class for all IO related exceptions.

[https://api.dart.dev/stable/2.13.1/dart-io/IOException-class.html](https://api.dart.dev/stable/2.13.1/dart-io/IOException-class.html)

### IsolateSpawnException

Thrown when an isolate cannot be created.

[https://api.dart.dev/stable/2.13.1/dart-isolate/IsolateSpawnException-class.html](https://api.dart.dev/stable/2.13.1/dart-isolate/IsolateSpawnException-class.html)

### NullRejectionException

Exception for when the promise is rejected with a `null` or `undefined` value.

This is public to allow users to catch when the promise is rejected with `null` or `undefined` versus some other value.

[https://api.dart.dev/stable/2.13.1/dart-js_util/NullRejectionException-class.html](https://api.dart.dev/stable/2.13.1/dart-js_util/NullRejectionException-class.html)

### ProcessException

[https://api.dart.dev/stable/2.13.1/dart-io/ProcessException-class.html](https://api.dart.dev/stable/2.13.1/dart-io/ProcessException-class.html)

### RedirectException

[https://api.dart.dev/stable/2.13.1/dart-io/RedirectException-class.html](https://api.dart.dev/stable/2.13.1/dart-io/RedirectException-class.html)

### SignalException

[https://api.dart.dev/stable/2.13.1/dart-io/SignalException-class.html](https://api.dart.dev/stable/2.13.1/dart-io/SignalException-class.html)

### SocketException

Exception thrown when a socket operation fails.

[https://api.dart.dev/stable/2.13.1/dart-io/SocketException-class.html](https://api.dart.dev/stable/2.13.1/dart-io/SocketException-class.html)

### StdoutException

Exception thrown by some operations of [Stdout](https://api.dart.dev/stable/2.13.1/dart-io/Stdout-class.html)

[https://api.dart.dev/stable/2.13.1/dart-io/StdoutException-class.html](https://api.dart.dev/stable/2.13.1/dart-io/StdoutException-class.html)

### TimeoutException

Thrown when a scheduled timeout happens while waiting for an async result.

[https://api.dart.dev/stable/2.13.1/dart-async/TimeoutException-class.html](https://api.dart.dev/stable/2.13.1/dart-async/TimeoutException-class.html)

### TlsException

A secure networking exception caused by a failure in the TLS/SSL protocol.

[https://api.dart.dev/stable/2.13.1/dart-io/TlsException-class.html](https://api.dart.dev/stable/2.13.1/dart-io/TlsException-class.html)

### WebSocketException

[https://api.dart.dev/stable/2.13.1/dart-io/WebSocketException-class.html](https://api.dart.dev/stable/2.13.1/dart-io/WebSocketException-class.html)

## エラー

### AbstractClassInstantiationError

Error thrown when trying to instantiate an abstract class.

[https://api.dart.dev/stable/2.1.1/dart-core/AbstractClassInstantiationError-class.html](https://api.dart.dev/stable/2.1.1/dart-core/AbstractClassInstantiationError-class.html)

### ArgumentError

Error thrown when a function is passed an unacceptable argument.

[https://api.dart.dev/stable/2.1.1/dart-core/ArgumentError-class.html](https://api.dart.dev/stable/2.1.1/dart-core/ArgumentError-class.html)

### AssertionError

Error thrown by the runtime system when an assert statement fails.

[https://api.dart.dev/stable/2.1.1/dart-core/AssertionError-class.html](https://api.dart.dev/stable/2.1.1/dart-core/AssertionError-class.html)

### AsyncError

Pair of error and stack trace. Returned by [Zone.errorCallback](https://api.dart.dev/stable/2.1.1/dart-async/Zone/errorCallback.html).

[https://api.dart.dev/stable/2.1.1/dart-async/AsyncError-class.html](https://api.dart.dev/stable/2.1.1/dart-async/AsyncError-class.html)

### CastError

Error thrown by the runtime system when a cast operation fails.

[https://api.dart.dev/stable/2.1.1/dart-core/CastError-class.html](https://api.dart.dev/stable/2.1.1/dart-core/CastError-class.html)

### ConcurrentModificationError

Error occurring when a collection is modified during iteration.

Some modifications may be allowed for some collections, so each collection ([Iterable](https://api.dart.dev/stable/2.1.1/dart-core/Iterable-class.html) or similar collection of values) should declare which operations are allowed during an iteration.

[https://api.dart.dev/stable/2.1.1/dart-core/ConcurrentModificationError-class.html](https://api.dart.dev/stable/2.1.1/dart-core/ConcurrentModificationError-class.html)

### CyclicInitializationError

Error thrown when a lazily initialized variable cannot be initialized.

A static/library variable with an initializer expression is initialized the first time it is read. If evaluating the initializer expression causes another read of the variable, this error is thrown.

[https://api.dart.dev/stable/2.1.1/dart-core/CyclicInitializationError-class.html](https://api.dart.dev/stable/2.1.1/dart-core/CyclicInitializationError-class.html)

### FallThroughError

Error thrown when control reaches the end of a switch case.

The Dart specification requires this error to be thrown when control reaches the end of a switch case (except the last case of a switch) without meeting a break or similar end of the control flow.

[https://api.dart.dev/stable/2.13.1/dart-core/FallThroughError-class.html](https://api.dart.dev/stable/2.13.1/dart-core/FallThroughError-class.html)

### IndexError

A specialized [RangeError](https://api.dart.dev/stable/2.13.1/dart-core/RangeError-class.html) used when an index is not in the range `0..indexable.length-1`.

Also contains the indexable object, its length at the time of the error, and the invalid index itself.

[https://api.dart.dev/stable/2.13.1/dart-core/IndexError-class.html](https://api.dart.dev/stable/2.13.1/dart-core/IndexError-class.html)

### JsonCyclicError

Reports that an object could not be stringified due to cyclic references.

An object that references itself cannot be serialized by [JsonCodec.encode](https://api.dart.dev/stable/2.13.1/dart-convert/JsonCodec/encode.html)/[JsonEncoder.convert](https://api.dart.dev/stable/2.13.1/dart-convert/JsonEncoder/convert.html). When the cycle is detected, a [JsonCyclicError](https://api.dart.dev/stable/2.13.1/dart-convert/JsonCyclicError-class.html) is thrown.

[https://api.dart.dev/stable/2.13.1/dart-convert/JsonCyclicError-class.html](https://api.dart.dev/stable/2.13.1/dart-convert/JsonCyclicError-class.html)

### JsonUnsupportedObjectError

Error thrown by JSON serialization if an object cannot be serialized.

The [unsupportedObject](https://api.dart.dev/stable/2.13.1/dart-convert/JsonUnsupportedObjectError/unsupportedObject.html) field holds that object that failed to be serialized.

If an object isn't directly serializable, the serializer calls the `toJson` method on the object. If that call fails, the error will be stored in the [cause](https://api.dart.dev/stable/2.13.1/dart-convert/JsonUnsupportedObjectError/cause.html) field. If the call returns an object that isn't directly serializable, the [cause](https://api.dart.dev/stable/2.13.1/dart-convert/JsonUnsupportedObjectError/cause.html) is null.

[https://api.dart.dev/stable/2.13.1/dart-convert/JsonUnsupportedObjectError-class.html](https://api.dart.dev/stable/2.13.1/dart-convert/JsonUnsupportedObjectError-class.html)

### NoSuchMethodError

Error thrown by the default implementation of `noSuchMethod` on [Object](https://api.dart.dev/stable/2.13.1/dart-core/Object-class.html).

[https://api.dart.dev/stable/2.13.1/dart-core/NoSuchMethodError-class.html](https://api.dart.dev/stable/2.13.1/dart-core/NoSuchMethodError-class.html)

### NullThrownError

Error thrown when attempting to throw `null`.

In null safe code, you are statically disallowed from throwing `null`, so this error will go away when non-null safe code stops being supported.

[https://api.dart.dev/stable/2.13.1/dart-core/NullThrownError-class.html](https://api.dart.dev/stable/2.13.1/dart-core/NullThrownError-class.html)

### OSError

An [Exception](https://api.dart.dev/stable/2.13.1/dart-core/Exception-class.html) holding information about an error from the operating system.

[https://api.dart.dev/stable/2.13.1/dart-io/OSError-class.html](https://api.dart.dev/stable/2.13.1/dart-io/OSError-class.html)

### OutOfMemoryError

Error that the platform can use in case of memory shortage.

[https://api.dart.dev/stable/2.13.1/dart-core/OutOfMemoryError-class.html](https://api.dart.dev/stable/2.13.1/dart-core/OutOfMemoryError-class.html)

### RangeError

Error thrown due to a value being outside a valid range.

[https://api.dart.dev/stable/2.13.1/dart-core/RangeError-class.html](https://api.dart.dev/stable/2.13.1/dart-core/RangeError-class.html)

### RemoteError

Description of an error from another isolate.

This error has the same `toString()` and `stackTrace.toString()` behavior as the original error, but has no other features of the original error.

[https://api.dart.dev/stable/2.1.1/dart-isolate/RemoteError-class.html](https://api.dart.dev/stable/2.1.1/dart-isolate/RemoteError-class.html)

### RemoteError

Description of an error from another isolate.

This error has the same `toString()` and `stackTrace.toString()` behavior as the original error, but has no other features of the original error.

[https://api.dart.dev/stable/2.13.1/dart-isolate/RemoteError-class.html](https://api.dart.dev/stable/2.13.1/dart-isolate/RemoteError-class.html)

### StateError

The operation was not allowed by the current state of the object.

Should be used when this particular object is currently in a state which doesn't support the requested operation, but other similar objects might, or the object might change its state to one which supports the operation. Example: Asking for `list.first` on a currently empty list. If the operation is never supported, consider using [UnsupportedError](https://api.dart.dev/stable/2.13.1/dart-core/UnsupportedError-class.html) instead.

This is a generic error used for a variety of different erroneous actions. The message should be descriptive.

[https://api.dart.dev/stable/2.13.1/dart-core/StateError-class.html](https://api.dart.dev/stable/2.13.1/dart-core/StateError-class.html)

### TypeError

Error thrown by the runtime system when a dynamic type error happens.

[https://api.dart.dev/stable/2.13.1/dart-core/TypeError-class.html](https://api.dart.dev/stable/2.13.1/dart-core/TypeError-class.html)

### UnimplementedError

Thrown by operations that have not been implemented yet.

This [Error](https://api.dart.dev/stable/2.13.1/dart-core/Error-class.html) is thrown by unfinished code that hasn't yet implemented all the features it needs.

If the class does not intend to implement the feature, it should throw an [UnsupportedError](https://api.dart.dev/stable/2.13.1/dart-core/UnsupportedError-class.html) instead. This error is only intended for use during development.

[https://api.dart.dev/stable/2.13.1/dart-core/StackOverflowError-class.html](https://api.dart.dev/stable/2.13.1/dart-core/StackOverflowError-class.html)

### UnsupportedError

The operation was not allowed by the object.

This [Error](https://api.dart.dev/stable/2.13.1/dart-core/Error-class.html) is thrown when an instance cannot implement one of the methods in its signature.

[https://api.dart.dev/stable/2.13.1/dart-core/UnsupportedError-class.html](https://api.dart.dev/stable/2.13.1/dart-core/UnsupportedError-class.html)
