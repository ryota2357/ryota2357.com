import * as React from "react";
import { Link, useStaticQuery, graphql } from "gatsby";
import "../style/layout.scss"

const Layout = ({ children }: { children: React.ReactNode }) => {
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

  const Header = () => (
    <header>
      {site?.siteMetadata.title}
    </header>
  );

  const Navigation = () => {
    const List = ({ name, to }: { name: string; to: string }) => (
      <li style={{ margin: "0 10px" }}>
        <Link to={to} style={{ color: "#242424" }}>
          {name}
        </Link>
      </li>
    );
    return (
      <nav>
        <ul>
          <List name="Home" to="/" key={`/`} />
          <List name="About" to="/about" key={`about`} />
          <List name="Blog" to="/blog" key={`blog`} />
          <List name="GameDev" to="/gamedev" key={`gamedev`} />
        </ul>
      </nav>
    );
  };

  const Footer = () => (
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
  );

  return (
    <div id="layout">
      <Header />
      <Navigation />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
