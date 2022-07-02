import { Layout, Seo } from "../components/mod";
import { unity1WeekGames } from "../data/mod";
import dayjs from "dayjs";
import "../style/pages/works.scss";

const Works = () => {
  const timeFmt = (time: Date) =>
    time ? dayjs(new Date(time)).format("YYYY/MM/DD (HH:mm)") : "";

  const gameData = unity1WeekGames.sort((a, b) =>
    a.posted < b.posted ? 1 : -1
  );

  return (
    <Layout id="works-page">
      <Seo title="GameDev" />
      <h1>Works</h1>
      <div className="table-of-contents">
        <h2>Table of Contents</h2>
        <ul>
          <li>
            <a href="#jump-id-works-games">Games</a>
            <ul>
              {gameData.map((game) => (
                <li key={game.href}>
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
                  <a href={game.href}>{game.title}</a>
                </h3>
                <div className="time">
                  <p>
                    公開:{" "}
                    <time itemProp="datePublished">{timeFmt(game.posted)}</time>
                  </p>
                  {game.update !== game.posted && (
                    <p>
                      最終更新:{" "}
                      <time itemProp="dateModified">
                        {timeFmt(game.update)}
                      </time>
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
