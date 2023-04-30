import { ReactNode } from "react";

type ContentBlockProp = {
  title: string;
  children: ReactNode;
};

const ContentBlock = ({ title, children }: ContentBlockProp) => {
  return (
    <div className="flex flex-col items-start gap-4">
      <h2 className="text-[1.6rem] font-bold">{title}</h2>
      <div className="flex flex-col gap-4 text-[1rem] pl-4 w-full">
        {children}
      </div>
    </div>
  );
};

export default ContentBlock;
