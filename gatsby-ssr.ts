import type { GatsbySSR } from "gatsby"
import React from "react"
import { dom } from "@fortawesome/fontawesome-svg-core"

// ref: https://github.com/jzabala/gatsby-plugin-fontawesome-css/blob/master/gatsby-ssr.js
let faStyleTag: any;

export const onRenderBody: GatsbySSR["onRenderBody"] = ({ setHtmlAttributes, setHeadComponents }) => {
  if (!faStyleTag) {
    faStyleTag = React.createElement('style', {
      key: 'user-gatsby-fontawesome-css',
      type: 'text/css',
      dangerouslySetInnerHTML: { __html: dom.css() },
    })
  }
  setHtmlAttributes({ lang: "ja" })
  setHeadComponents([faStyleTag])
}
