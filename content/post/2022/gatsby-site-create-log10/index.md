---
title: "10.Github Pagesでデプロイとアナリティクスとサイトマップ (Gatsby-jsによるサイト構築記録)"
postdate: "2022-03-13T09:01"
tags: ["Gatsby"]
---

> このサイトを作るまでの記録。(時系列順)  
> 実際に作業を行なったメモに追記、編集して投稿してるので投稿日と作業日は一致しない。
>
> スターターを`gatsby new`したのは 2022 年の 3 月上旬。
> `gatsby`のバージョンは 4.9
>
> [一覧はここ](../gatsby-site-create-log0/)

デプロイする。

## コマンドの用意

デプロイするコマンドを作る。

### gh-pages

```sh
$ npm i gh-pages --save-dev
```

で導入。

`--save-dev`オプションによって`package.json`の`dependencie`ではなく、`devDependencie`に記述される。

### npm run deploy

`package.json`の`scripts`プロパティに以下を追加する。

```json
...
  "scripts": {
    "deploy": "gatsby build && gh-pages -d public",
  }
}
```

## GitとGithub

### リポジトリを作る

privateだとGithubPagesは有料なので、publicでなリポジトリで作る。  
リポジトリ名は`ryota2357-github-pages`にしました。

開発でgitにコミットしてたけど、かなりコミットログが汚いので削除して、initから。

```sh
$ git init
$ git add .
$ git commit -m "first comm"
$ git branch -M main
$ git remote add origin https://github.com/ryota2357/ryota2357-github-pages.git
$ git push -u origin main
```

### デプロイ

さっきコマンドを作ったから簡単にできる。

```sh
$ npm run deploy
```

`https://ryota2357.github.io/ryota2357-github-pages`にデプロイできた。

## 独自ドメインの設定

GoogleDomainsで買った。

Aレコードを設定、[ここ](https://docs.github.com/ja/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)に書いてある値を入れる。

ついでに[ここ](https://docs.github.com/ja/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain-and-the-www-subdomain-variant)に書いてあるwwwの設定もやった。

### 参考

- [GitHub Pages – 独自ドメインを設定してHTTPS(SSL)にする方法](https://howpon.com/7674)
- [Using a Custom Domain Name with GitHub Pages](https://medium.com/@isphinxs/using-a-custom-domain-name-with-github-pages-c9cdc2084d54)

## Github Action の設定

毎回、`npm run deploy`するのは面倒なので自動化する。

`.github/workflows/gh-pages.yml`を作る。  
[サンプル](https://github.com/peaceiris/actions-gh-pages#%EF%B8%8F-gatsby)をいじった。  
秘密鍵の作り方は[ここ](https://github.com/peaceiris/actions-gh-pages#%EF%B8%8F-create-ssh-deploy-key)に書いてあった。

```yml
name: GitHub Pages

on:
  push:
    branches:
      - main
  pull_request:

jobs:
  deploy:
    runs-on: ubuntu-20.04
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '17'

      - name: Cache dependencies
        uses: actions/cache@v2
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      - run: npm ci
      - run: npm run format
      # - run: npm run test
      - run: npm run build

      # - name: Deploy
      #   uses: peaceiris/actions-gh-pages@v3
      #   if: ${{ github.ref == 'refs/heads/main' }}
      #   with:
      #     github_token: ${{ secrets.GITHUB_TOKEN }}
      #     publish_dir: ./public
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          deploy_key: ${{ secrets.ACTIONS_DEPLOY_KEY }}
          external_repository: ryota2357/ryota2357-github-pages
          publish_branch: gh-pages
          cname: ryota2357.com
```

### 参考

[Hugo + GitHub Pages + GitHub Actions で独自ドメインのウェブサイトを構築する](https://zenn.dev/nikaera/articles/hugo-github-actions-for-github-pages)

## Googleアナリティクス設定

gtagを使う

```sh
$ npm uninstall gatsby-plugin-google-analytics
$ npm install gatsby-plugin-google-gtag
```

googleアナリティクスでトラッキングIDを取得してきてgatsby-config.jsに設定

```js
module.exports = {
  plugins: [
  ...
    {
      resolve: 'gatsby-plugin-google-gtag',
      options: {
        trackingIds: ['G-0123456789'],
        pluginConfig: {
          head: true,
        },
      },
    },
  ...
  ]
}
```

## sitemap

```sh
$ npm i gatsby-plugin-sitemap
```

```js
module.exports = {
  plugins: [
  ...
  `gatsby-plugin-sitemap`
  ...
  ]
}
```

サーチコンソールとアナリティクスの連携もしておいた。

`https://ryota2357.com/sitemap.xml`にサイトマップが出力されるかと思いきや、`https://ryota2357.com/sitemap/sitemap-index.xml`に出力されるみたい。  
`/sitemap.xml`にサイトマップがなくてびっくりした。

参考 : [【Gatsbyブログ】gatsby-plugin-sitemapが3系から4系で仕様が変わっていた](https://takagi.blog/diff-v3-and-v4-of-gatsby-plugin-sitemap/)
