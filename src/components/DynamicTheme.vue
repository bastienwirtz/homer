<template>
  <DynamicStyle>
    :root, body #app.is-light {
    {{ getVars(themes.light) }}
    } @media (prefers-color-scheme: light), (prefers-color-scheme:
    no-preference) { :root, body #app {
    {{ getVars(themes.light) }}
    } } body #app.is-dark {
    {{ getVars(themes.dark) }}
    } @media (prefers-color-scheme: dark) { :root, body #app {
    {{ getVars(themes.dark) }}
    } }
  </DynamicStyle>
</template>

<script>
export default {
  name: "DynamicTheme",
  props: {
    themes: Object,
  },
  methods: {
    getVars: function (theme) {
      let vars = [];
      for (const themeVars in theme) {
        let value = `${theme[themeVars]}`;
        if (!value) {
          value = "initial";
        } else if (themeVars == "background-image") {
          value = `url(${theme[themeVars]})`;
        }
        vars.push(`--${themeVars}: ${value}`);
      }
      return vars.join(";");
    },
  },
};
</script>
