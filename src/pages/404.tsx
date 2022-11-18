import { Layout, Seo } from "@/components";
import "@/style/pages/404.scss";

const NotFoundPage = () => (
  <Layout id="not-found-page">
    <h1>
      <span>404</span>
      <span>Not Found</span>
    </h1>
  </Layout>
);

export const Head = () => <Seo title="404: Not Found" type="website" />;

export default NotFoundPage;
