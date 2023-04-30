import { Layout, Seo } from "@/components";

const NotFoundPage = () => (
  <Layout id="not-found-page">
    <h1 className="flex flex-col content-center justify-center text-[3rem] my-20 mx-0 text-black">
      <span className="text-center">404</span>
      <span className="text-center">Not Found</span>
    </h1>
  </Layout>
);

export const Head = () => (
  <Seo title="404: Not Found" type="website" image={["404"]} />
);

export default NotFoundPage;
