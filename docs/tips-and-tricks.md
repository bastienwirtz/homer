# Tips & Tricks

Here is a collection of neat tips and tricks that Homer users have come up with!

## Use Homer as a custom "new tab" page
#### `by @vosdev`

This [extension](https://addons.mozilla.org/firefox/addon/custom-new-tab-page) allows you to have your homer dashboard in your new tab page, while leaving focus on the address bar meaning you can still type right away if you want to search or go to a page that is not on your homer dash.

The extension loads Homer in an iframe on your new tab page, meaning you have to add `target: '_top'` to each of your items.

```yaml
- name: "Reddit"
  logo: "assets/daily/reddit.png"
  url: "https://reddit.com"
  target: '_top'

- name: "YouTube"
  logo: "assets/daily/youtube.png"
  url: "https://youtube.com"
  target: '_top'
```

## YAML Anchors
#### `by @JamiePhonic`

Since Homer is configured using YAML, it supports all of YAML's helpful fetaures, such as anchoring!

For example, you can define tags and tag styles for each "item" in a service. 
Using Anchoring, you can define all your tags and their styles once like this: (for example)

```yaml
# Some pre-defined tag styles. reference these using <<: *{NAME} inside an item definition; For Example, <<: *Apps
tags: 
  Favourite: &Favourite
    - tag: "Favourite"
      tagstyle: "is-medium is-primary"
  CI: &CI
    - tag: "CI"
      tagstyle: "is-medium is-success"
  Apps: &Apps
    - tag: "App"
      tagstyle: "is-medium is-info"      
```

and then simply reference these pre-defined (anchored) tags in each item like so:

```yaml
- name: "VS Code"
  logo: "/assets/vscode.png"
  subtitle: "Develope Code Anywhere, On Anything!"
  <<: *App # Regerence to the predefined "App" Tag
  url: "https://vscode.example.com/"
  target: "_blank" # optional html tag target attribute
````

Then when Homer reads your config, it will substitute your anchors automatically, the the above example is equal to:

```yaml
- name: "VS Code"
  logo: "/assets/vscode.png"
  subtitle: "Develope Code Anywhere, On Anything!"
  tag: "App"
  tagstyle: "is-medium is-info"
  url: "https://vscode.example.com/"
  target: "_blank" # optional html tag target attribute
```

The end result is that if you want to update the name or style of any perticular tag, just update it once, in the tags section! 
Great if you have a lot of services or a lot of tags!  

## Remotely edit your config with Code Server
#### `by @JamiePhonic`

Homer doesn't yet provide a way to edit your configuration from inside Homer itself, but that doesnt mean it cant be done!

You can setup and use [Code-Server](https://github.com/cdr/code-server) to edit your config.yml file from anywhere!

If you're running Homer in docker, you can setup a Code-Server container and pass your homer config directory into it.
Simply pass your homer config directory as and extra -v parameter to your code-server container:
```
-v '/your/local/homer/config-dir/':'/config/homer':'rw'
```
This will map your homer config directory (For example, /docker/appdata/homer/) into code-server's `/config/` directory, in a sub folder called `homer`

As a bonus, Code-Server puts the "current folder" as a parameter in the URL bar, so you could add a `links:` entry in Homer that points to your code-server instance with the directory pre-filled for essentially 1 click editing!

For example: 
```yml
links:
  - name: Edit config
    icon: fas fa-cog
    url: https://vscode.example.net/?folder=/config/homer
    target: "_blank" # optional html tag target attribute
```
where the path after `?folder=` is the path to the folder where you mounted your homer config INSIDE the Code-Server container.

### Example Code-Server docker create command
```sh
docker create \
  --name=code-server \
  -e PUID=1000 \
  -e PGID=1000 \
  -e TZ=Europe/London \
  -e PASSWORD={YOUR_PASSWORD} `#optional` \
  -e SUDO_PASSWORD={YOUR SUDO_PASSWORD} `#optional` \
  -p 8443:8443 \
  -v /path/to/appdata/config:/config \
  -v /your/local/homer/config-dir/:/config/homer \
  --restart unless-stopped \
  linuxserver/code-server
```
