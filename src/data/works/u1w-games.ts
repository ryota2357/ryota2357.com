import { getImageComponent } from "@/images";
import { WorksData } from "../types";

// GIF は object-fit とかが作用しないみたい (なんで？)
// ここで先にサイズ設定する必要がある
const unity1WeekGames: WorksData[] = [
  {
    title: "そろえる",
    description: `unity1week「そろえる」にて制作
                  複数のサイコロの目を同じする(そろえる)ゲーム`,
    url: "https://unityroom.com/games/soroeru_dice",
    img: getImageComponent("u1w-そろえる", { height: "8rem", width: "8rem" }),
    created: new Date("2022-05-14T15:04"),
    update: new Date("2022-05-15T08:17"),
    kind: "u1w",
  },
  {
    title: "回回回回",
    description: `unity1week「回」にて制作
                  「回」って並べるとテトリミノに見えたので、テトリスを「回」転する円柱形にしてみたゲーム`,
    url: "https://unityroom.com/games/kaikaikaikai",
    img: getImageComponent("u1w-回", { height: "8rem", width: "8rem" }),
    created: new Date("2021-03-04T14:28"),
    update: new Date("2021-03-06T11:37"),
    kind: "u1w",
  },
  {
    title: "開ける",
    description: `unity1week「あける」にて制作
                  ひたすら箱をあけるタイビング系のゲーム`,
    url: "https://unityroom.com/games/open_typing",
    img: getImageComponent("u1w-あける", { height: "8rem", width: "8rem" }),
    created: new Date("2020-12-29T22:28"),
    update: new Date("2020-12-30T14:06"),
    kind: "u1w",
  },
  {
    title: "ごく普通の金魚すくい",
    description: `unity1week「ふえる」にて制作
                  金魚が増える金魚すくい
                  良い感じに金魚を増やして高得点を目指すゲーム`,
    url: "https://unityroom.com/games/veryordinary_goldfishscooping",
    img: getImageComponent("u1w-ふえる", { height: "8rem", width: "8rem" }),
    created: new Date("2020-08-19T08:22"),
    update: new Date("2020-08-19T12:20"),
    kind: "u1w",
  },
  {
    title: "DivideGroup",
    description: `unity1week「密」にて制作
                  マウスだけで遊べるシンプルな「密」と「疎」を分類するゲーム`,
    url: "https://unityroom.com/games/dividegroup",
    img: getImageComponent("u1w-密", { height: "8rem", width: "8rem" }),
    created: new Date("2020-05-04T13:33"),
    update: new Date("2020-05-09T22:01"),
    kind: "u1w",
  },
  {
    title: "ReverseString",
    description: `unity1week「逆」にて制作
                  糸通しに"逆"の要素を追加してみたゲーム`,
    url: "https://unityroom.com/games/reversestring",
    img: getImageComponent("u1w-逆", { height: "8rem", width: "8rem" }),
    created: new Date("2020-03-01T19:48"),
    update: new Date("2020-03-02T14:41"),
    kind: "u1w",
  },
];

export default unity1WeekGames;
