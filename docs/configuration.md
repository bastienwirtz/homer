# Configuration

Title, icons, links, colors, and services can be configured in the `config.yml` file (located in `/assets` directory once built, or in the `public/assets` directory in development mode), using [yaml](http://yaml.org/) format.

```yaml
---
# Homepage configuration
# See https://fontawesome.com/v5/search for icons options

# Optional: Use external configuration file.
# Using this will ignore remaining config in this file
# externalConfig: https://example.com/server-luci/config.yaml

title: "App dashboard"
subtitle: "Homer"
# documentTitle: "Welcome" # Customize the browser tab text
logo: "assets/logo.png"
# Alternatively a fa icon can be provided:
# icon: "fas fa-skull-crossbones"

header: true # Set to false to hide the header
# Optional: Different hotkey for search, defaults to "/"
# hotkey:
#   search: "Shift"
footer: '<p>Created with <span class="has-text-danger">❤️</span> with <a href="https://bulma.io/">bulma</a>, <a href="https://vuejs.org/">vuejs</a> & <a href="https://fontawesome.com/">font awesome</a> // Fork me on <a href="https://github.com/bastienwirtz/homer"><i class="fab fa-github-alt"></i></a></p>' # set false if you want to hide it.

columns: "3" # "auto" or number (must be a factor of 12: 1, 2, 3, 4, 6, 12)
connectivityCheck: true # whether you want to display a message when the apps are not accessible anymore (VPN disconnected for example).
                        # You should set it to true when using an authentication proxy, it also reloads the page when a redirection is detected when checking connectivity.

# Optional: Proxy / hosting option
proxy:
  useCredentials: false # send cookies & authorization headers when fetching service specific data. Set to `true` if you use an authentication proxy. Can be overrided on service level. 

# Set the default layout and color scheme
defaults:
  layout: columns # Either 'columns', or 'list'
  colorTheme: auto # One of 'auto', 'light', or 'dark'

# Optional theming
theme: default # 'default' or one of the themes available in 'src/assets/themes'.

# Optional custom stylesheet
# Will load custom CSS files. Especially useful for custom icon sets.
# stylesheet:
#   - "assets/custom.css"

# Here is the exhaustive list of customization parameters
# However all value are optional and will fallback to default if not set.
# if you want to change only some of the colors, feel free to remove all unused key.
colors:
  light:
    highlight-primary: "#3367d6"
    highlight-secondary: "#4285f4"
    highlight-hover: "#5a95f5"
    background: "#f5f5f5"
    card-background: "#ffffff"
    text: "#363636"
    text-header: "#424242"
    text-title: "#303030"
    text-subtitle: "#424242"
    card-shadow: rgba(0, 0, 0, 0.1)
    link: "#3273dc"
    link-hover: "#363636"
    background-image: "assets/your/light/bg.png"
  dark:
    highlight-primary: "#3367d6"
    highlight-secondary: "#4285f4"
    highlight-hover: "#5a95f5"
    background: "#131313"
    card-background: "#2b2b2b"
    text: "#eaeaea"
    text-header: "#ffffff"
    text-title: "#fafafa"
    text-subtitle: "#f5f5f5"
    card-shadow: rgba(0, 0, 0, 0.4)
    link: "#3273dc"
    link-hover: "#ffdd57"
    background-image: "assets/your/dark/bg.png"

# Optional message
message:
  # url: "https://<my-api-endpoint>" # Can fetch information from an endpoint to override value below.
  # mapping: # allows to map fields from the remote format to the one expected by Homer
  #   title: 'id' # use value from field 'id' as title
  #   content: 'value' # value from field 'value' as content
  # refreshInterval: 10000 # Optional: time interval to refresh message
  #
  # Real example using chucknorris.io for showing Chuck Norris facts as messages:
  # url: https://api.chucknorris.io/jokes/random
  # mapping:
  #   title: 'id'
  #   content: 'value'
  # refreshInterval: 10000
  style: "is-warning"
  title: "Optional message!"
  icon: "fa fa-exclamation-triangle"
  content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."

# Optional navbar
# links: [] # Allows for navbar (dark mode, layout, and search) without any links
links:
  - name: "Link 1"
    icon: "fab fa-github"
    url: "https://github.com/bastienwirtz/homer"
    target: "_blank" # optional html tag target attribute
  - name: "link 2"
    icon: "fas fa-book"
    url: "https://github.com/bastienwirtz/homer"
  # this will link to a second homer page that will load config from page2.yml and keep default config values as in config.yml file
  # see url field and assets/page.yml used in this example:
  - name: "Second Page"
    icon: "fas fa-file-alt"
    url: "#page2"

# Services
# First level array represents a group.
# Leave only a "items" key if not using group (group name, icon & tagstyle are optional, section separation will not be displayed).
services:
  - name: "Application"
    icon: "fas fa-code-branch"
    # A path to an image can also be provided. Note that icon take precedence if both icon and logo are set.
    # logo: "path/to/logo"
    items:
      - name: "Awesome app"
        logo: "assets/tools/sample.png"
        # Alternatively a fa icon can be provided:
        # icon: "fab fa-jenkins"
        subtitle: "Bookmark example"
        tag: "app"
        keywords: "self hosted reddit" # optional keyword used for searching purpose
        url: "https://www.reddit.com/r/selfhosted/"
        target: "_blank" # optional html tag target attribute
      - name: "Another one"
        logo: "assets/tools/sample2.png"
        subtitle: "Another application"
        tag: "app"
        # Optional tagstyle
        tagstyle: "is-success"
        url: "#"
  - name: "Other group"
    icon: "fas fa-heartbeat"
    items:
      - name: "Pi-hole"
        logo: "assets/tools/sample.png"
        # subtitle: "Network-wide Ad Blocking" # optional, if no subtitle is defined, PiHole statistics will be shown
        tag: "other"
        url: "http://192.168.0.151/admin"
        type: "PiHole" # optional, loads a specific component that provides extra features. MUST MATCH a file name (without file extension) available in `src/components/services`
        target: "_blank" # optional html a tag target attribute
        # class: "green" # optional custom CSS class for card, useful with custom stylesheet
        # background: red # optional color for card to set color directly without custom stylesheet
```

View **[Custom Services](customservices.md)** for details about all available custom services (like `PiHole`) and how to configure them.

If you choose to fetch message information from an endpoint, the output format should be as follows (or you can [custom map fields as shown in tips-and-tricks](./tips-and-tricks.md#mapping-fields)):

```json
{
  "style": null,
  "title": "Lorem ipsum 42",
  "content": "LA LA LA Lorem ipsum dolor sit amet, ....."
}
```

`null` value or missing keys will be ignored and value from the `config.yml` will be used if available.
Empty values (either in `config.yml` or the endpoint data) will hide the element (ex: set `"title": ""` to hide the title bar).

## Style Options

Homer uses [bulma CSS](https://bulma.io/), which provides a [modifiers syntax](https://bulma.io/documentation/modifiers/syntax/). You'll notice in the config there is a `tagstyle` option. It can be set to any of the bulma modifiers. You'll probably want to use one of these 4 main colors:

- `is-info` (blue)
- `is-success` (green)
- `is-warning` (yellow)
- `is-danger` (red)

You can read the [bulma modifiers page](https://bulma.io/documentation/modifiers/syntax/) for other options regarding size, style, or state.

## Theming & customization

See `colors` settings in the configuration example above.
Favicon et application icon (pwa) are located in the `assets/icons` directory and can be replaced by any image you want (just keep the same name & size).
The `/assets/manifest.json` can also be edited to change the app (pwa) name, description and other settings.

### Community theme

- [Dracula theme](https://draculatheme.com/homer) by [@Tuetenk0pp](https://github.com/Tuetenk0pp)
- [Homer Theme v2](https://github.com/walkxcode/homer-theme) by [walkxcode](https://github.com/walkxcode)
- [Catppuccin theme](https://github.com/mrpbennett/catppucin-homer) by [@mrpbenett](https://github.com/mrpbennett)


## PWA Icons

See icons documentation [here](https://github.com/bastienwirtz/homer/blob/main/public/assets/icons/README.md).
