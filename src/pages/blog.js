import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import BlogCards from "../components/blogCards"

const Blog = ({ location }) => {
  return (
    <Layout location={location}>
      <Seo title="Blog List" />
      <h1>Blog</h1>
      <p><Link to="/blog/tag">タグの一覧</Link></p>
      <BlogCards count={1000} />
    </Layout>
  )
}

export default Blog