import { Layout, Seo } from "../components/mod";
import GameCards from "../components/gameCards";

const Works = () => {
  return (
    <Layout id="works">
      <Seo title="GameDev" />
      <h1>GameDev</h1>
      <GameCards count={1000} />
    </Layout>
  );
};

export default Works;
