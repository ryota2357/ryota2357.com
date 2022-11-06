# ryota2357-github-pages

[ryota2357.com](https://ryota2357.com)

## Set up

```sh
brew install node
brew install git gh
npm install -g gatsby-cli

gh repo clone ryota2357/ryota2357-github-pages
```

## `npm run new-post [slug]`

新しい投稿 md を生成するコマンド。
[util/src/new-post.dart](https://github.com/ryota2357/ryota2357-github-pages/blob/main/util/src/new-post.dart)

```txt
arg[0] (required) : slug
                    /blog/YYYY/{slug}
arg[1] (optional) : title
                    投稿のタイトル。省略した場合は質問されます。
arg[2] (optional) : tags
                    投稿のタグになります。この引数は可変長です。省略した場合は質問されます。
```

## deploy

main ブランチに push すると github action によって自動的にデプロイされる。
