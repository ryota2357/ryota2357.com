import { Layout, Seo, ContentBlock } from "../components/mod";
import { works } from "../data/mod";
import dayjs from "dayjs";
import "../style/pages/works.scss";

const Works = () => {
  const timeFmt = (time: Date, template: string) =>
    time ? dayjs(new Date(time)).format(template) : "";

  const sortByDate = (a: Date, b: Date) => (a < b ? 1 : -1);
  const gameData =
    works.get("u1w")?.sort((a, b) => sortByDate(a.created, b.created)) ?? [];
  const plugins =
    works.get("vim/neovim")?.sort((a, b) => sortByDate(a.created, b.created)) ??
    [];

  return (
    <Layout id="works-page">
      <h1>Works</h1>
      <div className="vim-neovim-plug" />
      <ContentBlock title="Vim/Neovim Plugins">
        <ul>
          {plugins.map((plug, index) => (
            <li key={index}>
              <h3>
                <a href={plug.url}>{plug.title}</a>
              </h3>
              <p className="italic gray indent">
                {plug.description.split("\n")[0] +
                  "\u00A0\u00A0" +
                  `(last commit: ${timeFmt(plug.update, "YYYY/MM/DD")})`}
              </p>
              {plug.description
                .split("\n")
                .slice(1)
                .map((line, index) => (
                  <p className="indent" key={index}>
                    {line}
                  </p>
                ))}
            </li>
          ))}
        </ul>
      </ContentBlock>
      <ContentBlock title="Games">
        <ul>
          {gameData.map((game, index) => (
            <li key={index}>
              <h3>
                <a href={game.url}>{game.title}</a>
              </h3>
              <div className="game-item">
                <div>
                  <div className="time indent">
                    <p>
                      公開:{" "}
                      <time>{timeFmt(game.created, "YYYY/MM/DD (HH:mm)")}</time>
                    </p>
                    {game.update !== game.created && (
                      <p>
                        最終更新:{" "}
                        <time>
                          {timeFmt(game.update, "YYYY/MM/DD (HH:mm)")}
                        </time>
                      </p>
                    )}
                  </div>
                  {game.description.split("\n").map((line, index) => (
                    <p className="indent" key={index}>
                      {line}
                    </p>
                  ))}
                </div>
                <div className="image">{game.img}</div>
              </div>
            </li>
          ))}
        </ul>
      </ContentBlock>
    </Layout>
  );
};

export const Head = () => <Seo title="Works" type="website" />

export default Works;
