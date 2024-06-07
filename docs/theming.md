# Theming

## Customization from yaml configuration file

Some aspect of the theme can be customized using the yaml configuration file.

```yml
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
```

## Additional stylesheets

One or more additional stylesheets can be loaded to add or override style from the current theme. Use the 'stylesheet' option in the yaml configuration file to add CSS file to be used.

```yml
stylesheet:
   - "assets/custom.css"
```

### customization exemple

#### Max width modification

```css
body #main-section .container {
    max-width: 2000px; // adjust to your needs (eg: calc(100% - 100px), none, ...)
}
```

#### Background gradiant

```css
#app {
    height: 100%;
    background: linear-gradient(90deg, #5c2483, #0095db);
}
```
