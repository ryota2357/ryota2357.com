import * as React from "react"
import { graphql, Link } from "gatsby"

import Layout from "../../components/layout"
import Seo from "../../components/seo"

const Tag = ({ data, location }) => {
  const counter = new Counter()
  data.allMarkdownRemark.nodes?.forEach(node => {
    node.frontmatter.tags?.forEach(tag => counter.increment(tag))
  })
  return (
    <Layout location={location}>
      <Seo title="Tag List" />
      <h1>Tag</h1>
      <ul>
        {counter.keys
          .sort() // 文字列ソート(アルファベット, 50音)
          .sort((a, b) => counter.get(b) - counter.get(a)) // 数が多い順のソート
          .map(key => (
            <li style={{ margin: "1rem 0" }}>
              <Link
                to={`/blog/tag/${key}`}
                style={{
                  fontSize: "1.1rem",
                }}
              >
                {key}
              </Link>
              {` : ${counter.get(key)}`}
            </li>
          ))}
      </ul>
    </Layout>
  )
}

export const pageQuery = graphql`
  query TagOnlyQuery {
    allMarkdownRemark {
      nodes {
        frontmatter {
          tags
        }
      }
    }
  }
`

class Counter {
  constructor() {
    this.map = {}
  }

  increment(key) {
    if (this.map.hasOwnProperty(key)) this.map[key] += 1
    else this.map[key] = 1
  }

  get keys() {
    return Object.keys(this.map)
  }

  get(key) {
    if (this.map.hasOwnProperty(key)) return this.map[key]
    else return 0
  }
}

export default Tag
