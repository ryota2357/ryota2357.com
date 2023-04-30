import { ReactNode } from "react";
import { Link, useStaticQuery, graphql } from "gatsby";

const Layout = ({ children }: { children: ReactNode }) => {
  const { site } = useStaticQuery<Queries.LayoutComponentQuery>(graphql`
    query LayoutComponent {
      site {
        siteMetadata {
          title
          author {
            name
          }
        }
      }
    }
  `);

  return (
    <div id="layout">
      <header className="flex flex-row flex-wrap justify-between my-4 mx-3">
        <div className="text-[2.1rem] font-bold select-none text-black [&_a:hover]:no-underline">
          <Link to="/">{site?.siteMetadata.title}</Link>
        </div>
        <nav className="mt-auto">
          <ul className="flex content-start text-[1.4rem] [&>li]:my-0 [&>li]:mx-[0.7rem]">
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
            <li>
              <Link to="/works">Works</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="max-w-[1080px] my-0 mx-auto py-0 px-[10px]">
        {children}
      </main>
      <footer className="text-[0.7rem] text-center mt-4">
        <p>
          Built with{" "}
          <a
            href="https://www.gatsbyjs.com"
            style={{ color: "inherit", fontWeight: "bold" }}
          >
            Gatsby
          </a>
        </p>
        <p>©2022 {site?.siteMetadata.author.name} All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
