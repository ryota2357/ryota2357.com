import * as React from "react"
import { graphql, Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const TagsTemplate = ({ data, location, pageContext }) => {
  const Card = ({ post, style }) => {
    const Date = () => (
      <p style={{ color: "#747474", marginBottom: "0" }}>
        {post.frontmatter.postdate}
      </p>
    )
    const Title = () => (
      <h3 style={{ margin: "0" }}>
        <Link to={post.fields.slug} itemProp="url" style={{ color: "#242424" }}>
          <span itemProp="headline">
            {post.frontmatter.title || post.fields.slug}
          </span>
        </Link>
      </h3>
    )
    const Tag = () => (
      <p style={{ display: "flex", justifyContent: "flex-end" }}>
        {post.frontmatter.tags &&
          post.frontmatter.tags.map((tag, i) => (
            <span
              style={{
                backgroundColor: "#000000",
                borderRadius: "2px",
                padding: "0.3rem 1rem",
                marginLeft: "0.3rem",
              }}
              key={i}
            >
              <Link to={`/blog/tag/${tag}`} style={{ color: "#ffffff" }}>
                {" "}
                {tag}{" "}
              </Link>
            </span>
          ))}
      </p>
    )
    return (
      <div itemScope itemType="http://schema.org/Article" style={style}>
        <Date />
        <Title />
        <Tag />
      </div>
    )
  }

  return (
    <Layout location={location}>
      <Seo title={`Tag: ${pageContext.tag}`} />
      <h1>{pageContext.tag}</h1>
      <p>{data.allMarkdownRemark.totalCount}件</p>
      <p>
        <Link to="/blog/tag">タグの一覧</Link>
      </p>
      {
        <div
          style={{
            display: "flex",
            flexFlow: "column",
            backgroundColor: "#ffffff",
            border: "solid 1px #999999",
            padding: "0 10px",
          }}
        >
          {data.allMarkdownRemark.nodes.map((post, i) => {
            // 最後の一個以外ボーダーで区切り線を入れる
            if (i >= data.allMarkdownRemark.nodes.length - 1)
              return <Card post={post} key={i} />
            return (
              <Card
                post={post}
                style={{ borderBottom: "solid 1px #E3E3E3" }}
                key={i}
              />
            )
          })}
        </div>
      }
    </Layout>
  )
}

export default TagsTemplate

export const pageQuery = graphql`
  query BlogPostByTag($tag: String!) {
    allMarkdownRemark(
      filter: { frontmatter: { tags: { eq: $tag } } }
      sort: { order: DESC, fields: frontmatter___postdate }
    ) {
      totalCount
      nodes {
        frontmatter {
          title
          postdate(formatString: "YYYY/MM/DD")
          tags
        }
        fields {
          slug
        }
      }
    }
  }
`
