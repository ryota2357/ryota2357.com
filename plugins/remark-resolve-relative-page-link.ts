import type { Node } from "unist";
import { VFile } from "vfile";
import { CONTINUE, visit, type Visitor } from "unist-util-visit";
import { convert, type Check } from "unist-util-is";
import { ensure, is } from "unknownutil";
import path from "path";

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
        throw new Error(
          `option.rootDirName: ${option.rootDirName} is not found`,
        );
      }
      return path.join(...currentFileDir.slice(lastIndex));
    })();

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
