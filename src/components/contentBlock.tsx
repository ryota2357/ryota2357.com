import { ReactNode } from "react";
import "@/style/components/contentBlock.scss";

type ContentBlockProp = {
  title: string;
  children: ReactNode;
};

const ContentBlock = ({ title, children }: ContentBlockProp) => {
  return (
    <div className="content-block">
      <h2>{title}</h2>
      <div className="children">{children}</div>
    </div>
  );
};

export default ContentBlock;
