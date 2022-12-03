import type { GatsbyBrowser } from "gatsby";
import { config } from "@fortawesome/fontawesome-svg-core";
import "destyle.css";
import "./src/style/global.scss";

// ref: https://medium.com/@johnny02/how-to-add-font-awesome-to-a-gatsby-site-89da940924d5
export const onClientEntry: GatsbyBrowser["onClientEntry"] = () => {
  config.autoAddCss = false;
};
