FROM mcr.microsoft.com/devcontainers/javascript-node:20-bullseye

# Set username variable
# ARG USERNAME="node"

# Change ownership of the .zshrc to the user
# RUN chown $USERNAME /home/$USERNAME/.zshrc

# [Optional] Uncomment this section to install additional OS packages.
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends gnupg2 fontconfig \
    fonts-jetbrains-mono fonts-cascadia-code fonts-powerline build-essential ruby-full fzf

RUN gem install colorls

# [Optional] Uncomment if you want to install an additional version of node using nvm
# ARG EXTRA_NODE_VERSION=10
# RUN su node -c "source /usr/local/share/nvm/nvm.sh && nvm install ${EXTRA_NODE_VERSION}"

# [Optional] Uncomment if you want to install more global node modules
# RUN su node -c "npm i -g @githubnext/github-copilot-cli"
# RUN su node -c "npm i -g pnpm"
