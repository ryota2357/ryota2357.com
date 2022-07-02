import { ReactNode } from "react";
import { Link, useStaticQuery, graphql } from "gatsby";
import "../style/components/layout.scss";

const Layout = ({ id, children }: { id: string; children: ReactNode }) => {
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
      <header>
        <div className="logo">
          <Link to="/">{site?.siteMetadata.title}</Link>
        </div>
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
              <Link to="/works">Works</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main id={id}>{children}</main>
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
