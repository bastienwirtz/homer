<template>
  <DynamicStyle>
    /* light / dark theme switch based on system pref if available */ body #app
    {
    {{ getVars(themes.light) }}
    } @media (prefers-color-scheme: light), (prefers-color-scheme:
    no-preference) { body #app {
    {{ getVars(themes.light) }}
    } } @media (prefers-color-scheme: dark) { body #app { } } /* light / dark
    theme override base on user choice. */ body #app.is-dark {
    {{ getVars(themes.dark) }}
    } body #app.is-light {
    {{ getVars(themes.light) }}
    }
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
        vars.push(`--${themeVars}: ${theme[themeVars]}`);
      }
      return vars.join(";");
    },
  },
};
</script>
