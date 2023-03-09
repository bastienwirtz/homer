# Keeping your forked copy current

If you like to build from sources, then keeping your code in sync with the original is something you probably want to do on occasion.

Starting from your forked copy, make sure you have the latest forked code (of your copy)
```
git pull
git checkout main
```


Next, add the original repository as a remote to your local forked repository. This enables fetching the latest changes from the original repository (or upstream).
```
# add upstream if if not already a remote
git remote add upstream https://github.com/bastienwirtz/homer.git

# fetch latest changes
git fetch upstream
```


Once you have the latest changes, you can merge them into your local branch. Afterward, you're ready to push this back to your repo
```
# merge changes
git merge upstream/main

# push the changes to your forked repository
git push origin main
```

Once you have done this, all that's required in the future is to `git fetch upstream`, `git merge upstream/main` and then `git push origin main`