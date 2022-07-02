import { CSSProperties } from "react";
import { StaticImage } from "gatsby-plugin-image";

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
      return (
        <img
          alt="icon-unity1week-mitu"
          src="./icon-unity1week-mitu.gif"
          style={style}
        />
      );
    case "u1w-ふえる":
      return (
        <img
          alt="icon-unity1week-hueru"
          src="./icon-unity1week-hueru.gif"
          style={style}
        />
      );
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
          src="./icon-unity1week-kai.png"
          style={style}
        />
      );
    case "u1w-そろえる":
      return (
        <img
          alt="icon-unity1week-soroeru"
          src="./icon-unity1week-soroeru.gif"
          style={style}
        />
      );
    default:
      throw new Error("!!");
  }
}
