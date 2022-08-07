import type { WorksData } from "../types";

const githubProducts: WorksData[] = [
  {
    title: "dein-snip",
    url: "https://github.com/ryota2357/dein-snip.lua",
    description: `The wrapper plugin for dein.vim.
                  init.luaでdeinをいい感じにするために作った`,
    created: new Date("2022-08-04"),
    update: new Date("2022-08-04"),
    kind: "vim/neovim",
  },
  {
    title: "ddu-column-icon_filename",
    url: "ryota2357/ddu-column-icon_filename",
    description: `Icon and filename column for ddu.vim.
                  dduプラグイン
                  ddu-ui-filerでファイルアイコン付きのcolumnが欲しかったので作った`,
    created: new Date("2022-07-11"),
    update: new Date("2022-08-05"),
    kind: "vim/neovim",
  },
  {
    title: "vim-skim-synctex",
    url: "ryota2357/vim-skim-synctex",
    description: `This plugin enables you to do synctex with Skim.app.
                  denopsプラグイン
                  vimでlatex書くときsynctexがしたかったので作った`,
    created: new Date("2022-06-04"),
    update: new Date("2022-07-25"),
    kind: "vim/neovim",
  },
];
export default githubProducts;
