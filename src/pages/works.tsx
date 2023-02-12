import { graphql, PageProps } from "gatsby";
import { Layout, Seo, ContentBlock } from "@/components";
import dayjs from "dayjs";
import "@/style/pages/works.scss";

function formatTime(time: Date): string {
  return dayjs(new Date(time)).format("YYYY/MM/DD (HH:mm)");
}

const Works = ({ data }: PageProps<Queries.WorksPageQuery>) => {
  return (
    <Layout id="works-page">
      <h1>Works</h1>
      {data.allWorksDataYaml.nodes.map((one) => (
        <ContentBlock title={one.name}>
          <ul>
            {one.data.map((item, index) => (
              <li key={index}>
                <h3>
                  <a href={item.url} target="_blank">
                    {item.title}
                  </a>
                </h3>
                <div className="item">
                  <div className="indent">
                    <p className="gray">
                      公開: <time>{formatTime(new Date(item.created))}</time>
                    </p>
                    {item.created != item.update && (
                      <p className="gray">
                        最終更新:{" "}
                        <time>{formatTime(new Date(item.update))}</time>
                      </p>
                    )}
                    {item.description.split("\n").map((line) => (
                      <p>{line}</p>
                    ))}
                  </div>
                  <img
                    src={item.image?.publicURL!}
                    alt={`${item.title} icon`}
                    style={{
                      objectFit: "cover",
                      width: "8rem",
                      height: "8rem",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </ContentBlock>
      ))}
    </Layout>
  );
};

export const Head = () => (
  <Seo title="Works" type="website" image={["works"]} />
);

export default Works;

export const query = graphql`
  query WorksPage {
    allWorksDataYaml(sort: { name: ASC }) {
      nodes {
        name
        data {
          title
          description
          url
          created
          update
          image {
            publicURL
          }
        }
      }
    }
  }
`;
