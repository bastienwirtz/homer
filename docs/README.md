# Homer docs

Live on github pages: [https://bastienwirtz.github.io/homer/](https://bastienwirtz.github.io/homer/)

## Local development

### Install Python dependencies

Homer's documentation is built using [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/). To get started, you'll need Python 3 installed on your machine and set up your local environment.

```sh
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Preview local copy

MkDocs comes with a command-line utility for building and serving the static documentation site every time you save a file. To launch it, run the `serve` command.

```sh
mkdocs serve
```

Your local version of the docs site will now be available at http://localhost:8000/.
