import * as React from "react"
import { Link, graphql } from "gatsby"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTags } from "@fortawesome/free-solid-svg-icons"

import Layout from "../components/layout"
import Seo from "../components/seo"

const BlogPostTemplate = ({ data, location }) => {
  const BlogBody = ({ post }) => {
    const Date = () => (
      <div style={{
        display: 'flex',
        fontSize: '0.8rem',
        color: '#747474',
      }}>
        <p style={{ margin: '0' }} >投稿日: {post.frontmatter.postdate}</p>
        {post.frontmatter.update && (
          <p style={{ margin: '0 0 0 1rem' }}>更新日: {post.frontmatter.update}</p>)
        }
      </div>
    )
    const Tags = () => (
      <div style={{ marginTop: '10px' }}>
      <FontAwesomeIcon icon={faTags} style={{ color: '#2E2E2E', marginRight: '5px' }} />
      {post.frontmatter.tags && post.frontmatter.tags.map((tag, i) => {
        var t = tag
        if(i < post.frontmatter.tags.length - 1) t += ","
        return (
          <Link to={`/blog/tag/${tag}`} style={{
            color: '#505050',
            marginRight: '5px'
          }}>{t}</Link>
        )
      })}
      </div>
    )

    return (
      <article itemScope itemType="http://schema.org/Article" style={{
          backgroundColor: '#ffffff',
          boxShadow: '0 0 10px #323232',
          padding: '2em'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 itemProp="headline">{ post.frontmatter.title }</h1>
          <Date />
          <Tags />
        </div>

        <div className="markdown" itemProp="articleBody"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>
    )
  }

  const BlogNav = ({ previous, next }) => (
    <nav>
      <ul style={{
        display: `flex`,
        flexWrap: `wrap`,
        justifyContent: `space-between`,
        listStyle: `none`,
        padding: 0,
      }}>
        <li>
          {previous && (
            <Link to={previous.fields.slug} rel="prev">
              ← {previous.frontmatter.title}
            </Link>
          )}
        </li>
        <li>
          {next && (
            <Link to={next.fields.slug} rel="next">
              {next.frontmatter.title} →
            </Link>
          )}
        </li>
      </ul>
    </nav>
  )

  return (
    <Layout location={location}>
      <Seo
        title={data.markdownRemark.frontmatter.title}
        description={data.markdownRemark.frontmatter.description || data.markdownRemark.excerpt}
      />
      <BlogBody post={data.markdownRemark} />
      <BlogNav previous={data.previous} next={data.next} />
    </Layout>
  )
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug(
    $id: String!
    $previousPostId: String
    $nextPostId: String
  ) {
    markdownRemark(id: { eq: $id }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        postdate(formatString: "YYYY/MM/DD (HH:mm)")
        update(formatString: "YYYY/MM/DD (HH:mm)")
        tags
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
`
