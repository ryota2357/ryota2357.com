import { Layout, Seo } from "../components/mod";
import { works } from "../data/mod";
import dayjs from "dayjs";
import "../style/pages/works.scss";

const Works = () => {
  const timeFmt = (time: Date) =>
    time ? dayjs(new Date(time)).format("YYYY/MM/DD (HH:mm)") : "";

  const gameData =
    works.get("u1w")?.sort((a, b) => (a.created < b.created ? 1 : -1)) ?? [];

  return (
    <Layout id="works-page">
      <Seo title="Works" />
      <h1>Works</h1>
      <div className="table-of-contents">
        <h2>Table of Contents</h2>
        <ul>
          <li>
            <a href="#jump-id-works-games">Games</a>
            <ul>
              {gameData.map((game) => (
                <li key={game.url}>
                  <a href={`#jump-id-works-games-${game.title}`}>
                    {game.title}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>
      <div className="games" id="jump-id-works-games">
        <h2>Games</h2>
        <ul>
          {gameData.map((game, index) => (
            <li key={index} id={`jump-id-works-games-${game.title}`}>
              <div className="item">
                <h3>
                  <a href={game.url}>{game.title}</a>
                </h3>
                <div className="time">
                  <p>
                    公開: <time>{timeFmt(game.created)}</time>
                  </p>
                  {game.update !== game.created && (
                    <p>
                      最終更新: <time>{timeFmt(game.update)}</time>
                    </p>
                  )}
                </div>
                <div className="description">
                  {game.description.split("\n").map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              </div>
              <div className="image">{game.img}</div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default Works;
