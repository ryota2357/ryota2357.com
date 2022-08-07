import unity1WeekGames from "./works/u1w-games";
import githubProducts from "./works/github";
import type { DataKind, WorksData } from "./types";

const works = new Map<DataKind, WorksData[]>();

works.set("u1w", unity1WeekGames);
works.set("vim/neovim", githubProducts);

export { works };
