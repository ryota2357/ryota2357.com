import path from "node:path";
import type { Node } from "unist";
import { type Check, convert } from "unist-util-is";
import { CONTINUE, visit } from "unist-util-visit";
import { ensure, is } from "unknownutil";
import type { VFile } from "vfile";

type Option = {
  rootDirName: string;
};

export default function resolveRelativePageLink(option: Option) {
  const isRelativePageLink: Check = (node) => {
    const isLink = convert("link");
    if (isLink(node) && "url" in node) {
      const url = ensure(node.url, is.String);
      return url.startsWith("../") && path.extname(url) === "";
    }
    return false;
  };

  return (tree: Node, vfile: VFile) => {
    const rootPath = (() => {
      const currentFileDir = vfile.history.at(-1)?.split(path.sep).slice(0, -1);
      if (!currentFileDir) {
        throw new Error("vfile.history is empty");
      }
      const lastIndex = currentFileDir.lastIndexOf(option.rootDirName);
      if (lastIndex === -1) {
        const yellow = "\u001b[33m";
        const reset = "\u001b[0m";
        console.warn(
          [
            `${yellow}[WARN: remark-resolve-relative-page-link]${reset}`,
            `option.rootDirName: '${option.rootDirName}' is not found.`,
            `(${path.join("/", ...currentFileDir, "/")})`,
          ].join(" "),
        );
        return undefined;
      }
      return path.join(...currentFileDir.slice(lastIndex));
    })();

    if (!rootPath) {
      return;
    }

    visit(tree, isRelativePageLink, (node) => {
      if (!("url" in node)) return CONTINUE;
      node.url = path.join(
        path.resolve("/", rootPath, node.url as string),
        "/",
      );
      return CONTINUE;
    });
  };
}
