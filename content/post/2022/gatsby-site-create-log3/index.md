---
title: "3.整理 (Gatsby-jsによるサイト構築記録)"
postdate: "2022-03-09T17:27"
update: "2022-03-09T17:27"
tags: ["Gatsby"]
---

> このサイトを作るまでの記録。(時系列順)  
> 実際に作業を行なったメモに追記、編集して投稿してるので投稿日と作業日は一致しない。
>
> スターターを `gatsby new` したのは 2022 年の 3 月上旬。
> `gatsby` のバージョンは 4.9
>
> [一覧はここ](../gatsby-site-create-log0/)

大まかなレイアウト調整、いらないものを削除、コードの整理を行う。

新しい機能の追加は行わない。

## CSS

`src/style.css` の内容を全削除して初期値として与えたい要素を追加。

```css
html {
  font-family: YuGothic, "Yu Gothic", "Hiragino Kaku Gothic ProN",
    "ヒラギノ角ゴ ProN W3", "ＭＳ ゴシック", sans-serif;
  background-color: #f6f5f5;
  color: #242424;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
}

h2 {
  font-size: 1.7rem;
  font-weight: bold;
}

h3 {
  font-size: 1.3rem;
  font-weight: bold;
}

h4 {
  font-size: 1.1rem;
  font-weight: bold;
}

p {
  font-size: 1rem;
}

a {
  color: blue;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
```

## 色々いじる

気になったところから編集開始

### pages/index.js

なんかネスト深くて読みにくいし、list 表示じゃなくて、ただの div の羅列にしたかったので適当に編集  
記事が 1 つもない時の処理があったけど必要なさそうだったから削除

```jsx
import * as React from "react";
import { Link, graphql } from "gatsby";

import Bio from "../components/bio";
import Layout from "../components/layout";
import Seo from "../components/seo";

const Index = ({ data, location }) => {
  const BlogCard = ({ post }) => (
    <article
      className="post-list-item"
      itemScope
      itemType="http://schema.org/Article"
    >
      <div>
        <h2>
          <Link to={`/blog${post.fields.slug}`} itemProp="url">
            <span itemProp="headline">
              {post.frontmatter.title || post.fields.slug}
            </span>
          </Link>
        </h2>
        <p>{post.frontmatter.date}</p>
        <p
          dangerouslySetInnerHTML={{
            __html: post.frontmatter.description || post.excerpt,
          }}
          itemProp="description"
        />
      </div>
    </article>
  );

  return (
    <Layout location={location} title={data.site.siteMetadata.title}>
      <Seo title="Home" />
      <Bio />
      <div
        style={{
          display: "flex",
          flexFlow: "column",
        }}
      >
        {data.allMarkdownRemark.nodes.map((post) => {
          return <BlogCard post={post} />;
        })}
      </div>
    </Layout>
  );
};

export default Index;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "YYYY/MM/DD")
          title
          description
        }
      }
    }
  }
`;
```

### components/layout.js

原型とどめないほどにいじってしまった。  
最初はコンポーネントに分離とかさせてただけなんだけど、style とか変えてるうちになんかこうなった。

引数に `title` あったけど不要な気がしたので削除、StaticQuery で直接取得してる。  
`title` 削除してビルドしてもエラー出ないから、Layout コンポーネントが使われているところを見つけ次第順次変更しておく。

あと、`data-is-root-path` って何？一箇所だけ div で使われてるのだが、何をしてるのだろう...まあ、そのままにしといた。

```jsx
import * as React from "react";
import { Link, useStaticQuery, graphql } from "gatsby";

const Layout = ({ location, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`;
  const { site } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          author {
            name
          }
        }
      }
    }
  `);

  const Header = () => (
    <header style={{ margin: "20px 0" }}>
      <Link
        to="/"
        style={{
          color: "#000000",
          fontSize: "2rem",
          fontWeight: "bold",
          padding: "0 10px",
        }}
      >
        {site.siteMetadata.title}
      </Link>
    </header>
  );

  const Footer = () => (
    <footer
      style={{
        textAlign: "center",
        fontSize: "0.7rem",
      }}
    >
      <p>
        Built with{" "}
        <a href="https://www.gatsbyjs.com" style={{ color: "inherit" }}>
          Gatsby
        </a>
      </p>
      <p>©2022 {site.siteMetadata.author.name} All Rights Reserved.</p>
    </footer>
  );

  return (
    <div
      className="global-layout"
      data-is-root-path={location.pathname === rootPath}
    >
      <Header />
      <main
        style={{
          maxWidth: "1080px",
          margin: "auto",
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
```

### templates/blog-post.js

コンポーネントを分割して、ローカル変数を消したくらい

```jsx
import * as React from "react";
import { Link, graphql } from "gatsby";

import Layout from "../components/layout";
import Seo from "../components/seo";

const BlogPostTemplate = ({ data, location }) => {
  const BlogBody = ({ post }) => (
    <article
      className="blog-post"
      itemScope
      itemType="http://schema.org/Article"
    >
      <div>
        <h1 itemProp="headline">{post.frontmatter.title}</h1>
        <p>{post.frontmatter.date}</p>
      </div>

      <div
        itemProp="articleBody"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </article>
  );

  const BlogNav = ({ previous, next }) => (
    <nav>
      <ul
        style={{
          display: `flex`,
          flexWrap: `wrap`,
          justifyContent: `space-between`,
          listStyle: `none`,
          padding: 0,
        }}
      >
        <li>
          {previous && (
            <Link to={`/blog${previous.fields.slug}`} rel="prev">
              ← {previous.frontmatter.title}
            </Link>
          )}
        </li>
        <li>
          {next && (
            <Link to={`/blog${next.fields.slug}`} rel="next">
              {next.frontmatter.title} →
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );

  return (
    <Layout location={location}>
      <Seo
        title={data.markdownRemark.frontmatter.title}
        description={
          data.markdownRemark.frontmatter.description ||
          data.markdownRemark.excerpt
        }
      />
      <BlogBody post={data.markdownRemark} />
      <BlogNav previous={data.previous} next={data.next} />
    </Layout>
  );
};

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
    previous: markdownRemark(id: { eq: $previousPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
    next: markdownRemark(id: { eq: $nextPostId }) {
      fields {
        slug
      }
      frontmatter {
        title
      }
    }
  }
`;
```

## 現在

![現在の状況](now.gif)
