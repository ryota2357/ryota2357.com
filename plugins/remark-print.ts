import type { Node } from "unist";
import { inspect } from "unist-util-inspect";
import type { VFileCompatible } from "vfile";

type Option = {
  node?: boolean;
  vfile?: boolean;
};

export default function print(option: Option) {
  return (tree: Node, file: VFileCompatible) => {
    if (option.node) {
      console.log(inspect(tree));
    }
    if (option.vfile) {
      console.log(inspect(file));
    }
  };
}
