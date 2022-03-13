import 'dart:io';

// Directory.current is '~/ryota2357.com/util'

void main(List<String> args) async {
  if (args.isEmpty) {
    print('At least one argument is required');
    help();
    return;
  }
  if (args[0] == 'help' || args[0] == '-h') {
    help();
    return;
  }

  final template = await File('./src/template.md').readAsString();
  final date = DateTime.now();
  final slug = args[0];
  final title = args.length > 1 ? args[1] : question('Input post title');
  final tags = args.length > 2 ? args.skip(2).toList() : List.empty();

  final filePath = '../content/post/${date.year}/${slug}/index.md';
  await File(filePath).create(recursive: true);
  File(filePath).writeAsString(template
      .replaceFirst('"{title}"', '"${title}"')
      .replaceFirst('"{date}"', '"${date.toIso8601String().substring(0, 16)}"')
      .replaceFirst('"{tags}"', tags.map((i) => '"${i}"').join(', ')));
}

void help() {
  print('''
== help ==
新しい投稿mdを生成するコマンド。
util/src/new-post.dart

arg[0] (required) : slug
                    /blog/YYYY/{slug}
arg[1] (optional) : title
                    投稿のタイトル。ない場合は質問されます。
arg[2] (optional) : tags
                    投稿のタグになります。この引数は可変長です。
''');
}

String question(String msg) {
  print(msg);
  return stdin.readLineSync() ?? '';
}
