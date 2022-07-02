import { getImageComponent } from "../images/mod";

// GIF は object-fit とかが作用しないみたい (なんで？)
// ここで先にサイズ設定する必要がある
const unity1WeekGames = [
  {
    title: "そろえる",
    description: "unity1week「そろえる」にて制作したサイコロそろえるゲーム",
    href: "https://unityroom.com/games/soroeru_dice",
    img: getImageComponent("u1w-そろえる", { height: "8rem", width: "8rem" }),
    posted: new Date("2022-05-14T15:04"),
    update: new Date("2022-05-15T08:17"),
  },
  {
    title: "回回回回",
    description: `unity1week「回」にて作成した落ちものパズルゲーム
                  テトリスを円柱形にしてみた`,
    href: "https://unityroom.com/games/kaikaikaikai",
    img: getImageComponent("u1w-回", { height: "8rem", width: "8rem" }),
    posted: new Date("2021-03-04T14:28"),
    update: new Date("2021-03-06T11:37"),
  },
  {
    title: "開ける",
    description: `unity1week「あける」にて作成したタイピング(?)ゲーム
                  ひたすら箱を開けるだけ`,
    href: "https://unityroom.com/games/open_typing",
    img: getImageComponent("u1w-あける", { height: "8rem", width: "8rem" }),
    posted: new Date("2020-12-29T22:28"),
    update: new Date("2020-12-30T14:06"),
  },
  {
    title: "ごく普通の金魚すくい",
    description: `unity1week「ふえる」にて作成した金魚すくいゲーム
                  金魚が増える金魚すくい`,
    href: "https://unityroom.com/games/veryordinary_goldfishscooping",
    img: getImageComponent("u1w-ふえる", { height: "8rem", width: "8rem" }),
    posted: new Date("2020-08-19T08:22"),
    update: new Date("2020-08-19T12:20"),
  },
  {
    title: "DivideGroup",
    description: `unity1week「密」にて作成したゲーム
                  マウスだけで遊べるシンプルなゲーム`,
    href: "https://unityroom.com/games/dividegroup",
    img: getImageComponent("u1w-密", { height: "8rem", width: "8rem" }),
    posted: new Date("2020-05-04T13:33"),
    update: new Date("2020-05-09T22:01"),
  },
  {
    title: "ReverseString",
    description: `unity1week「逆」にて作成した糸通しゲーム
                  糸通しに"逆"の要素を追加してみた`,
    href: "https://unityroom.com/games/reversestring",
    img: getImageComponent("u1w-逆", { height: "8rem", width: "8rem" }),
    posted: new Date("2020-03-01T19:48"),
    update: new Date("2020-03-02T14:41"),
  },
];

export default unity1WeekGames;
