import * as React from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"
import GameCards from "../components/gameCards"

const Game = ({ location }) => {
  return (
    <Layout location={location}>
      <Seo title="GameDev" />
      <h1>GameDev</h1>
      <GameCards count={1000} />
    </Layout>
  )
}

export default Game