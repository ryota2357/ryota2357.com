import { CSSProperties } from "react";
import { StaticImage } from "gatsby-plugin-image";

// gif は import しないと表示されない
import u1w_mitu from "./icon-unity1week-mitu.gif";
import u1w_hueru from "./icon-unity1week-hueru.gif";
import u1w_soroeru from "./icon-unity1week-soroeru.gif";

const imageName = {
  _gyaku__: "u1w-逆",
  _mitu___: "u1w-密",
  _hueru__: "u1w-ふえる",
  _akeru__: "u1w-あける",
  _aki____: "u1w-回",
  _soroeru: "u1w-そろえる",
} as const;

type ImageName = typeof imageName[keyof typeof imageName];

export function getImageComponent(name: ImageName, style?: CSSProperties) {
  switch (name) {
    case "u1w-逆":
      return (
        <StaticImage
          alt="icon-unity1week-gyaku"
          src="./icon-unity1week-gyaku.png"
          style={style}
        />
      );
    case "u1w-密":
      return <img alt="icon-unity1week-mitu" src={u1w_mitu} style={style} />;
    case "u1w-ふえる":
      return <img alt="icon-unity1week-hueru" src={u1w_hueru} style={style} />;
    case "u1w-あける":
      return (
        <StaticImage
          alt="icon-unity1week-akeru"
          src="./icon-unity1week-akeru.png"
          style={style}
        />
      );
    case "u1w-回":
      return (
        <StaticImage
          alt="icon-unity1week-kai"
          src="./icon-unity1week-kai.jpg"
          style={style}
        />
      );
    case "u1w-そろえる":
      return (
        <img alt="icon-unity1week-soroeru" src={u1w_soroeru} style={style} />
      );
    default:
      throw new Error("!!");
  }
}
