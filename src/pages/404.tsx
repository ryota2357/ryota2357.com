import { Layout, Seo } from "../components/mod";
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
