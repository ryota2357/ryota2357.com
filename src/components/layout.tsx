import { ReactNode } from "react";
import { Link, useStaticQuery, graphql } from "gatsby";
import "../style/layout.scss";

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

  const List = ({ name, to }: { name: string; to: string }) => (
    <li>
      <Link to={to}>{name}</Link>
    </li>
  );

  return (
    <div id="layout">
      <header>{site?.siteMetadata.title}</header>
      <nav>
        <ul>
          <List name="Home" to="/" />
          <List name="About" to="/about" />
          <List name="Blog" to="/blog" />
          <List name="GameDev" to="/gamedev" />
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
