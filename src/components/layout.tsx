import { ReactNode } from "react";
import { Link, useStaticQuery, graphql } from "gatsby";
import "../style/components/layout.scss";

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
      <header>{site?.siteMetadata.title}</header>
      <nav>
        <ul>
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
            <Link to="/gamedev">GameDev</Link>
          </li>
        </ul>
      </nav>
      <main>{children}</main>
      <footer>
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
