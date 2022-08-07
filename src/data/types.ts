type DataKind = "u1w" | "vim/neovim" | "other"

type WorksData = {
  title: string;
  description: string;
  url: string;
  img?: JSX.Element | string;
  created: Date;
  update: Date;
  kind: DataKind;
}

export { DataKind, WorksData }
