import 'dart:io';

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

  print(Directory.current);

  final date = DateTime.now();
  final slug = args[0];
  final filePath = '../../src/content/blog/${date.year}/${slug}/index.md';
  if (await File(filePath).exists()) {
    print('ERROR: You have alread usedysame slug : $slug');
    return;
  }

  final template = await File('./template.md').readAsString();
  final title = args.length > 1 ? args[1] : question('Input post title');
  final tags = args.length > 2
      ? args.skip(2).toList()
      : question('Input post tag (split by ",")')
          .replaceAll(' ', '')
          .split(',');

  await File(filePath).create(recursive: true);
  final file = await File(filePath).writeAsString(template
      .replaceAll('"{title}"', '"${title}"')
      .replaceAll('"{date}"', '"${date.toIso8601String().substring(0, 16)}"')
      .replaceAll('"{tags}"', tags.map((i) => '"${i}"').join(', ')));

  print('Created new post');
  print(' cd ${file.parent.absolute.uri.path}');
}

void help() {
  print('''
== help ==
新しい投稿mdを生成するコマンド。
util/src/new-post.dart

arg[0] (required) : slug
                    /blog/YYYY/{slug}
arg[1] (optional) : title
                    投稿のタイトル。省略した場合は質問されます。
arg[2] (optional) : tags
                    投稿のタグになります。この引数は可変長です。省略した場合は質問されます。
''');
}

String question(String msg) {
  stdout.writeln(msg);
  stdout.write('> ');
  return stdin.readLineSync() ?? '';
}
