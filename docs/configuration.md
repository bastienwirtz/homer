# Configuration

Title, icons, links, colors, and services can be configured in the `config.yml`
file (located in `/assets` directory once built, or in the `public/assets`
directory in development mode), using [yaml](http://yaml.org/) format.

```yaml
---
# Homepage configuration
# See https://fontawesome.com/v5/search for icons options

# Optional: Use external configuration file.
# Using this will ignore remaining config in this file
# externalConfig: https://example.com/server-luci/config.yaml

title: "App dashboard"
subtitle: "Homer"
# Customize the browser tab text
# documentTitle: "Welcome"
logo: "assets/logo.png"
# Alternatively a Font Awesome icon can be provided
# icon: "fas fa-skull-crossbones"

# Set to false to hide the header
header: true
# Set to false to hide the footer
footer: >
  <p>Created with <span class="has-text-danger">❤️</span> with
  <a href="https://bulma.io/">bulma</a>,
  <a href="https://vuejs.org/">vuejs</a>, &
  <a href="https://fontawesome.com/">font awesome</a>
  // Fork me on <a href="https://github.com/bastienwirtz/homer">
  <i class="fab fa-github-alt"></i></a></p>

# Use "auto" or number (must be a factor of 12: 1, 2, 3, 4, 6, 12)
columns: "3"
# Whether you want to display a message when the apps are not accessible
# anymore (VPN disconnected for example)
connectivityCheck: true

# Optional: Set a different hotkey for search, defaults to "/"
# hotkey:
#   search: "Shift"

# Optional: Proxy / hosting option
proxy:
  # Send cookies & authorization headers when fetching service specific data.
  # Set to `true` if you use an authentication proxy. Can be overrided on
  # service level.
  useCredentials: false

# Set the default layout and color scheme
defaults:
  layout: columns # Either 'columns', or 'list'
  colorTheme: auto # One of 'auto', 'light', or 'dark'

# Optional theming: 'default' or one of the themes available in
# 'src/assets/themes'.
theme: default

# Optional custom stylesheet
# Will load custom CSS files. Especially useful for custom icon sets.
# stylesheet:
#   - "assets/custom.css"

# Here is the exhaustive list of customization parameters, however all values
# are optional and will fallback to default if not set. If you want to change
# only some of the colors, feel free to remove all unused keys.
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
  # Uses Bulma. See https://bulma.io/documentation/components/message/#colors
  # for styling options.
  style: "is-warning"
  title: "Optional message!"
  icon: "fa fa-exclamation-triangle"
  content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."

  # Can optionally fetch information from an endpoint to override value below.
  # url: "https://<my-api-endpoint>"
  # mapping: # Select the appropriate fields from the response object.
  #   title: 'id'       # Use value from field 'id' as title
  #   content: 'value'  # Use value from field 'value' as content
  # refreshInterval: 10000 # Optional: time interval to refresh message
  #
  # Real example using chucknorris.io for showing Chuck Norris facts:
  # url: https://api.chucknorris.io/jokes/random
  # mapping:
  #   title: 'id'
  #   content: 'value'
  # refreshInterval: 10000

# Optional navbar
# Specify [] for navbar (dark mode, layout, and search) without any links
# links: [] 
links:
  - name: "Link 1"
    icon: "fab fa-github"
    url: "https://github.com/bastienwirtz/homer"
    target: "_blank" # optional html tag target attribute
  - name: "link 2"
    icon: "fas fa-book"
    url: "https://github.com/bastienwirtz/homer"
  # Urls starting with # will link to additional Homer pages. Passing "#page2"
  # will load config from page2.yml as overrides on top of the default values
  # set in this config.yml.
  - name: "Second Page"
    icon: "fas fa-file-alt"
    url: "#page2"

# Services
# First level array represents a group. Use only an "items" key if not using
# groups (name, icon, & tagstyle are optional; section separation will not be
# displayed).
services:
  - name: "Application"
    icon: "fas fa-code-branch"
    # A path to an image can also be provided. Note that icon will take
    # precedence if both icon and logo are set.
    # logo: "path/to/logo"
    items:
      - name: "Awesome app"
        logo: "assets/tools/sample.png"
        # Alternatively a fa icon can be provided:
        # icon: "fab fa-jenkins"
        subtitle: "Bookmark example"
        tag: "app"
        url: "https://www.reddit.com/r/selfhosted/"
        # Optional: HTML <a> tag target attribute
        target: "_blank"
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
        # Optional: If no subtitle is defined, PiHole statistics will be shown.
        # subtitle: "Network-wide Ad Blocking"
        tag: "other"
        url: "http://192.168.0.151/admin"
        # Optional: Loads a specific component that provides extra features.
        # MUST MATCH a file name (without file extension) available in
        # `src/components/services`
        type: "PiHole" 
        # Optional: HTML <a> tag target attribute
        target: "_blank"
        # Optional: Custom CSS class for card, useful with custom stylesheet
        # class: "green"
        # Optional: Set background color directly without custom stylesheet
        # background: red
```

View [Custom Services](custom_services.md) for details about all available
custom services (like PiHole) and how to configure them.

If you choose to fetch message information from an endpoint, the output format
should be as follows (or you can
[custom map fields as shown in tips and tricks](tips_and_tricks#mapping-fields)):

```json
{
  "style": null,
  "title": "Lorem ipsum 42",
  "content": "LA LA LA Lorem ipsum dolor sit amet, ....."
}
```

`null` value or missing keys will be ignored and value from the `config.yml`
will be used if available. Empty values (either in `config.yml` or the endpoint
data) will hide the element (ex: set `"title": ""` to hide the title bar).

## Style Options

Homer uses [Bulma CSS](https://bulma.io/), which provides a
[modifiers syntax](https://bulma.io/documentation/modifiers/syntax/). You'll
notice in the config there is a `tagstyle` option. It can be set to any of the
bulma modifiers. You'll probably want to use one of these 4 main colors:

- `is-info` (blue)
- `is-success` (green)
- `is-warning` (yellow)
- `is-danger` (red)

You can read the [bulma modifiers page](https://bulma.io/documentation/modifiers/syntax/)
for other options regarding size, style, or state.

## PWA Icons

In order to easily generate all required icon preset for the PWA to work, a tool
like [vue-pwa-asset-generator](https://www.npmjs.com/package/vue-pwa-asset-generator)
can be used:

```bash
npx vue-pwa-asset-generator -a {your_512x512_source_png} -o {your_output_folder}
```
