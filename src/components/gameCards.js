import * as React from "react";
import { StaticImage } from "gatsby-plugin-image";

import soroeruGIF from "../images/icon_game_1week_soroeru.gif";
import hueruGIF from "../images/icon_game_1week_hueru.gif";
import mituGIF from "../images/icon_game_1week_mitu.gif";

const GameCards = ({ count }) => {
  const Games = [
    {
      title: "そろえる",
      description: "unity1week「そろえる」にて制作したサイコロそろえるゲーム",
      href: "https://unityroom.com/games/soroeru_dice",
      img: (
        <img
          alt="soroeru_icon"
          src={soroeruGIF}
          style={{ width: "8rem", height: "8rem" }}
        />
      ),
      posted: "2022/05/14 15:04",
      update: "2022/05/15 08:17",
    },
    {
      title: "回回回回",
      description: `unity1week「回」にて作成した落ちものパズルゲーム<br />テトリスを円柱形にしてみた`,
      href: "https://unityroom.com/games/kaikaikaikai",
      img: (
        <StaticImage
          alt="kai_icon"
          src="../images/icon_game_1week_kai.jpg"
          style={{ width: "8rem", height: "8rem" }}
        />
      ),
      posted: "2021/03/04 14:28",
      update: "2021/03/06 11:37",
    },
    {
      title: "開ける",
      description: `unity1week「あける」にて作成したタイピング(?)ゲーム<br />ひたすら箱を開けるだけ`,
      href: "https://unityroom.com/games/open_typing",
      img: (
        <StaticImage
          alt="akeru_icon"
          src="../images/icon_game_1week_akeru.png"
          style={{ width: "8rem", height: "8rem" }}
        />
      ),
      posted: "2020/12/29 22:28",
      update: "2020/12/30 14:06",
    },
    {
      title: "ごく普通の金魚すくい",
      description: `unity1week「ふえる」にて作成した金魚すくいゲーム<br />金魚が増える金魚すくい`,
      href: "https://unityroom.com/games/veryordinary_goldfishscooping",
      img: (
        <img
          alt="hueru_icon"
          src={hueruGIF}
          style={{ width: "8rem", height: "8rem" }}
        />
      ),
      posted: "2020/08/19 08:22",
      update: "2020/08/19 12:20",
    },
    {
      title: "DivideGroup",
      description: `unity1week「密」にて作成したゲーム<br />マウスだけで遊べるシンプルなゲーム`,
      href: "https://unityroom.com/games/dividegroup",
      img: (
        <img
          alt="mitu_icon"
          src={mituGIF}
          style={{ width: "8rem", height: "8rem" }}
        />
      ),
      posted: "2020/05/04 13:33",
      update: "2020/05/09 22:01",
    },
    {
      title: "ReverseString",
      description: `unity1week「逆」にて作成した糸通しゲーム<br />糸通しに"逆"の要素を追加してみた`,
      href: "https://unityroom.com/games/reversestring",
      img: (
        <StaticImage
          alt="gyaku_icon"
          src="../images/icon_game_1week_gyaku.png"
          style={{ width: "8rem", height: "8rem" }}
        />
      ),
      posted: "2020/03/01 19:48",
      update: "2020/03/02 14:41",
    },
  ];
  const Card = ({ aGame }) => (
    <div
      style={{
        backgroundColor: "#ffffff",
        display: "flex",
        border: "solid 1px #999999",
        padding: "5px",
        marginBottom: "5px",
        borderRadius: "10px",
      }}
    >
      <div style={{ width: "100%" }}>
        <h3 style={{ marginTop: "0", fontSize: "1.5rem" }}>{aGame.title}</h3>
        <p
          style={{ fontSize: "1.1rem", lineHeight: "1.5rem" }}
          dangerouslySetInnerHTML={{ __html: aGame.description }}
        />
        <a
          href={aGame.href}
          style={{
            fontSize: "1.2rem",
            textAlign: "center",
            backgroundColor: "#00bfff",
            color: "#242424",
            display: "flex",
            justifyContent: "space-around",
            padding: "5px 0",
            margin: "auto",
            borderRadius: "10px",
          }}
        >
          unityroom(ブラウザ)で遊ぶ
        </a>
      </div>
      <div style={{ marginLeft: "5px" }}>{aGame.img}</div>
    </div>
  );
  return Games.slice(0, count).map((game, i) => <Card aGame={game} key={i} />);
};

export default GameCards;
