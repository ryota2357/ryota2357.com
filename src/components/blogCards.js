import * as React from "react"
import { Link, graphql, useStaticQuery } from "gatsby"

const BlogCards = ({ count }) => {
  const data = useStaticQuery(graphql`
    query {
      allMarkdownRemark(sort: { fields: [frontmatter___postdate], order: DESC }) {
        nodes {
          excerpt
          fields {
            slug
          }
          frontmatter {
            title
            postdate(formatString: "YYYY/MM/DD")
            update(formatString: "YYYY/MM/DD")
            tags
          }
        }
      }
    }
  `)

  const Card = ({ post, style }) => {
    const Date = () => (<p style={{ color: '#747474', marginBottom: '0' }}>{ post.frontmatter.postdate }</p>)
    const Title = () => (
      <h3 style={{ margin: '0' }}>
        <Link to={post.fields.slug} itemProp="url" style={{ color: '#242424' }}>
          <span itemProp="headline">{ post.frontmatter.title || post.fields.slug }</span>
        </Link>
      </h3>
    )
    const Tag = () => (
      <p style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {post.frontmatter.tags && (post.frontmatter.tags.map((tag, i)=> (
          <span style={{
            backgroundColor: '#000000',
            borderRadius: '2px',
            padding: '0.3rem 1rem',
            marginLeft: '0.3rem'
          }} key={i}>
            <Link to={`/blog/tag/${tag}`} style={{ color: '#ffffff' }}>{ tag }</Link>
          </span>
        )))}
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
    <div style={{
      display: 'flex',
      flexFlow: 'column',
      backgroundColor: '#ffffff',
      border: 'solid 1px #999999',
      padding: '0 10px',
      }}>
      {
        data.allMarkdownRemark.nodes.slice(0, count).map((post, i) => {
          // 最後の一個以外ボーダーで区切り線を入れる
          if (i >= count-1) return <Card post={post} key={i}/>
          return <Card post={post} style={{ borderBottom: 'solid 1px #E3E3E3' }} key={i}/>
        })
      }
    </div>
  )
}

export default BlogCards