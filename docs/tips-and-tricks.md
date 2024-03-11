# Tips & Tricks

Here is a collection of neat tips and tricks that Homer users have come up with!

## Use Homer as a custom "new tab" page

#### `by @vosdev`

These extensions for [Firefox](https://addons.mozilla.org/firefox/addon/custom-new-tab-page) and [Chrome & Friends](https://chrome.google.com/webstore/detail/new-tab-changer/occbjkhimchkolibngmcefpjlbknggfh) allow you to have your homer dashboard in your new tab page, while leaving focus on the address bar meaning you can still type right away if you want to search or go to a page that is not on your homer dash.

The Firefox extension loads Homer in an iframe on your new tab page, meaning you have to add `target: '_top'` to each of your items.

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

Since Homer is configured using YAML, it supports all of YAML's helpful features, such as anchoring!

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
  subtitle: "Develop Code Anywhere, On Anything!"
  <<: *Apps # Reference to the predefined "App" Tag
  url: "https://vscode.example.com/"
  target: "_blank" # optional html tag target attribute
````

Then when Homer reads your config, it will substitute your anchors automatically, the above example is equal to:

```yaml
- name: "VS Code"
  logo: "/assets/vscode.png"
  subtitle: "Develop Code Anywhere, On Anything!"
  tag: "App"
  tagstyle: "is-medium is-info"
  url: "https://vscode.example.com/"
  target: "_blank" # optional html tag target attribute
```

The end result is that if you want to update the name or style of any particular tag, just update it once, in the tags section!
Great if you have a lot of services or a lot of tags!  

## Remotely edit your config with Code Server

#### `by @JamiePhonic`

Homer doesn't yet provide a way to edit your configuration from inside Homer itself, but that doesn't mean it can't be done!

You can setup and use [Code-Server](https://github.com/cdr/code-server) to edit your `config.yml` file from anywhere!

If you're running Homer in docker, you can setup a Code-Server container and pass your homer config directory into it.
Simply pass your homer config directory as an extra -v parameter to your code-server container:

```sh
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

## Get the news headlines in Homer

### Mapping Fields

Most times, the url you're getting headlines from follows a different schema than the one expected by Homer.

For example, if you would like to show jokes from ChuckNorris.io, you'll find that the url <https://api.chucknorris.io/jokes/random> is giving you info like this:

```json
{
  "categories": [],
  "created_at": "2020-01-05 13:42:22.089095",
  "icon_url": "https://assets.chucknorris.host/img/avatar/chuck-norris.png",
  "id": "MR2-BnMBR667xSpQBIleUg",
  "updated_at": "2020-01-05 13:42:22.089095",
  "url": "https://api.chucknorris.io/jokes/MR2-BnMBR667xSpQBIleUg",
  "value": "Chuck Norris can quitely sneak up on himself"
}
```

but... you need that info to be transformed to something like this:

```json
{
  "title": "MR2-BnMBR667xSpQBIleUg",
  "content": "Chuck Norris can quitely sneak up on himself"
}
```

Now, you can do that using the `mapping` field in your `message` configuration. This example would be something like this:

```yml
message:
  url: https://api.chucknorris.io/jokes/random
  mapping:
    title: 'id'
    content: 'value'
```

As you would see, using the ID as a title doesn't seem nice, that's why when a field is empty it would keep the default values, like this:

```yml
message:
  url: https://api.chucknorris.io/jokes/random
  mapping:
    content: 'value'
  title: "Chuck Norris Facts!"
```

and even an error message in case the `url` didn't respond or threw an error:

```yml
message:
  url: https://api.chucknorris.io/jokes/random
  mapping:
    content: 'value'
  title: "Chuck Norris Facts!"
  content: "Message could not be loaded"
```

#### `by @JamiePhonic`

Homer allows you to set a "message" that will appear at the top of the page, however, you can also supply a `url:`.

If the URL you specified returns a JSON object that defines a `title` and `content` item, homer will replace these values from your `config.yml` with the ones in the returned object.

So, using [Node-Red](https://nodered.org/docs/getting-started/) and a quick flow, you can process an RSS feed to replace the message with a news item!

To get started, simply import [this flow](https://flows.nodered.org/flow/4b6406c9a684c26ace0430dd1826e95d) into your Node-Red instance and change the RSS feed in the "Get News RSS Feed" node to one of your choosing!

So far, the flow has been tested with BBC News and Sky News, however it should be easy to modify the flow to work with other RSS feeds if they don't work out of the box!


## Protecting Homer with nginx and oauth2-proxy

#### `by @craiggenner`

[oauth2-proxy](https://github.com/oauth2-proxy/oauth2-proxy) is "A reverse proxy and static file server that provides authentication using Providers (Google, GitHub, and others) to validate accounts by email, domain or group."

Using oauth2-proxy with [nginx](https://nginx.org/en/) and the [auth_request](https://nginx.org/en/docs/http/ngx_http_auth_request_module.html) parameter it's possible to protect Homer behind an authentication proxy.

Reasons for doing this vary, but include wanting to hide private interfaces from the general public, but a VPN is too heavy weight.

nginx doesn't have to be used with oauth2-proxy, any of the authentication fatures of nginx can be used and there are plenty of guides for this.

### Homer config

Nothing special is required, but it's recomended that the `connectivityCheck` parameter is set to `true` so that when the authentication expires you are redirected to the login and don't get an error message in Homer:

```yml
connectivityCheck: true
```

### oauth2-proxy setup and config

Nothing special is required. Setup as per your authentication requirements and test pointing to a local static file.

### nginx config

Within a nginx vhost the config looks like this:

```
server {

    root /var/www/;
    index index.html;
    server_name homer.example.com;

    listen 443 ssl;
    ssl_certificate /etc/certs/fullchain.pem;
    ssl_certificate_key /etc/certs/privkey.pem;

    # OAuth2 Proxy
    location /oauth2/ {
      proxy_pass       http://127.0.0.1:8081;
      proxy_set_header Host                    $host;
      proxy_set_header X-Real-IP               $remote_addr;
      proxy_set_header X-Scheme                $scheme;
      proxy_set_header X-Auth-Request-Redirect $request_uri;
    }
    location = /oauth2/auth {
      proxy_pass       http://127.0.0.1:8081;
      proxy_set_header Host             $host;
      proxy_set_header X-Real-IP        $remote_addr;
      proxy_set_header X-Scheme         $scheme;
      # nginx auth_request includes headers but not body
      proxy_set_header Content-Length   "";
      proxy_pass_request_body           off;
    }

    location @error401 {
      return 302 $scheme://$host/oauth2/sign_in;
    }

    location / {
        auth_request /oauth2/auth;
        error_page 401 = @error401;

        proxy_pass http://localhost:8080/;
	allow all;
    }
}
```
