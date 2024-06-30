#!/bin/zsh


# Clone the Powerlevel10k theme repository into the home directory
# This theme is used to customize the appearance of the command line prompt.
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ~/powerlevel10k

# Append the Powerlevel10k theme source command to .zshrc to activate the theme.
# This makes the Powerlevel10k theme available every time a new shell session is started.
echo 'source ~/powerlevel10k/powerlevel10k.zsh-theme' >>~/.zshrc

# Copy the .p10k.zsh configuration file to the home directory.
# This file contains user-specific Powerlevel10k configuration settings.
cp .devcontainer/profiles/.p10k.zsh ~/.p10k.zsh

# Append a check to .zshrc to source the .p10k.zsh file if it exists.
# This ensures that the Powerlevel10k configuration is loaded with each new shell session.
# Additionally, advises on how to customize the Powerlevel10k prompt.
echo "[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh" >>~/.zshrc
# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.

git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# Update the ZSH_THEME in .zshrc to use Powerlevel10k
sed -i 's/^ZSH_THEME=".*"/ZSH_THEME="powerlevel10k\/powerlevel10k"/' ~/.zshrc

# Adding aliases to .zshrc
echo 'alias c="code"' >> ~/.zshrc
echo 'alias pn="pnpm"' >> ~/.zshrc
echo 'alias y="yarn"' >> ~/.zshrc
echo 'alias gs="git status"' >> ~/.zshrc
echo 'alias ".."="cd .."' >> ~/.zshrc
echo 'alias zshconfig="c ~/.zshrc"' >> ~/.zshrc
echo 'alias ohmyzsh="c ~/.oh-my-zsh"' >> ~/.zshrc
echo 'alias ls="colorls --sd --gs"' >> ~/.zshrc
echo 'alias lsl="colorls -l --sd --gs"' >> ~/.zshrc
echo 'alias lsd="colorls -d --sd --gs"' >> ~/.zshrc
echo 'alias lsf="colorls -f --sd --gs"' >> ~/.zshrc
echo 'alias lst="colorls --tree --gs --sd"' >> ~/.zshrc

# do not delete / or prompt if deleting more than 3 files at a time #
echo 'alias rm="rm -I --preserve-root"' >> ~/.zshrc

# confirmation #
echo 'alias mv="mv -iv"' >> ~/.zshrc
echo 'alias cp="cp -iv"' >> ~/.zshrc
echo 'alias ln="ln -iv"' >> ~/.zshrc

# Parenting changing perms on / #
echo 'alias chown="chown --preserve-root"' >> ~/.zshrc
echo 'alias chmod="chmod --preserve-root"' >> ~/.zshrc
echo 'alias chgrp="chgrp --preserve-root"' >> ~/.zshrc

# Reload .zshrc to apply changes
source ~/.zshrc
