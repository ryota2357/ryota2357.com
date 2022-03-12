import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import BlogCards from "../components/blogCards"
import GameCards from "../components/gameCards"


const Index = ({ location }) => {
  const ToALl = ({ to }) => (
    <Link to={to} style={{
      color: '#000000',
      fontSize: '2rem',
      marginTop: '10px',
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      一覧 &gt;&gt;
    </Link>
  )
  return (
    <Layout location={location}>
      <Seo title="Home" />

      <h2>Blog</h2>
      <BlogCards count={5} />
      <ToALl to="/blog" />

      <h2>GameDev</h2>
      <GameCards count={3}/>
      <ToALl to="/gamedev" />

    </Layout>
  )
}

export default Index
