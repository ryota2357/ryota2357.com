import Layout from "../components/layout";
import Seo from "../components/seo";
import "../style/pages/404.scss";

const NotFoundPage = () => (
  <Layout id="not-found-page">
    <Seo title="404: Not Found" />
    <h1>
      <span>404</span>
      <span>Not Found</span>
    </h1>
  </Layout>
);

export default NotFoundPage;
