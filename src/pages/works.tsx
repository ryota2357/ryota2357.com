import { graphql, PageProps } from "gatsby";
import { Layout, Seo, ContentBlock } from "@/components";
import dayjs from "dayjs";

function formatTime(time: Date): string {
  return dayjs(new Date(time)).format("YYYY/MM/DD (HH:mm)");
}

const Works = ({ data }: PageProps<Queries.WorksPageQuery>) => {
  return (
    <Layout id="works-page">
      <h1 className="text-[2.5rem]">Works</h1>
      <div className="flex flex-col gap-8 mt-8">
        {data.allWorksDataYaml.nodes.map((one) => (
          <ContentBlock title={one.name} key={one.name}>
            <ul className="[&>li+li]:mt-4">
              {one.data.map((item, index) => (
                <li key={`item-${index}`}>
                  {/* \20 = white space */}
                  <h3 className="text-2xl font-bold before:content-['-\20']">
                    <a href={item.url} target="_blank" rel="noreferrer">
                      {item.title}
                    </a>
                  </h3>
                  <div className="flex flex-row justify-between gap-4">
                    <div className="pl-4">
                      <p className="text-gray-500">
                        公開: <time>{formatTime(new Date(item.created))}</time>
                      </p>
                      {item.created !== item.update && (
                        <p className="text-gray-500">
                          最終更新:{" "}
                          <time>{formatTime(new Date(item.update))}</time>
                        </p>
                      )}
                      {item.description.split("\n").map((line, index) => (
                        <p key={`line-${index}`}>{line}</p>
                      ))}
                    </div>
                    <img
                      src={item.image!.publicURL!}
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
      </div>
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
