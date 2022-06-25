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

  const Header = () => (
    <header style={{ margin: "20px 0 10px 0" }}>
      <span
        style={{
          color: "#000000",
          fontSize: "2rem",
          fontWeight: "bold",
          padding: "0 10px",
          userSelect: "none",
        }}
      >
        {site?.siteMetadata.title}
      </span>
    </header>
  );

  const Nav = () => {
    const List = ({ name, to }: { name: string; to: string }) => (
      <li style={{ margin: "0 10px" }}>
        <Link to={to} style={{ color: "#242424" }}>
          {name}
        </Link>
      </li>
    );
    return (
      <nav>
        <ul
          style={{
            fontSize: "1.2rem",
            display: "flex",
            justifyContent: "flex-start",
            listStyle: "none",
            margin: "0 10px 20px 10px",
            padding: "0",
          }}
        >
          <List name="Home" to="/" key={`/`} />
          <List name="About" to="/about" key={`about`} />
          <List name="Blog" to="/blog" key={`blog`} />
          <List name="GameDev" to="/gamedev" key={`gamedev`} />
        </ul>
      </nav>
    );
  };

  const Footer = () => (
    <footer
      style={{
        textAlign: "center",
        fontSize: "0.7rem",
      }}
    >
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
    <div className="global-layout">
      <Header />
      <Nav />
      <main
        style={{
          maxWidth: "1080px",
          margin: "auto",
          padding: "0 5px",
        }}
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
