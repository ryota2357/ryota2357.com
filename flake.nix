{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShellNoCC {
          packages = with pkgs; [
            nodejs_22
            pnpm
            shellcheck

            astro-language-server
            tailwindcss-language-server
            vscode-css-languageserver
            vscode-json-languageserver
            nil
          ];
          shellHook = ''
            currentHooksPath=$(git config --local --get core.hooksPath)
            if [ "$currentHooksPath" != ".githooks" ]; then
              echo "Setting Git hooksPath to .githooks..."
              git config --local core.hooksPath .githooks
            fi
          '';
        };
      }
    );
}
