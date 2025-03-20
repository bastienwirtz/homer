<template>
  <DynamicStyle>
    :root,
    body #app.light {
      {{ generateThemeVariables(themes.light) }}
    }

    @media (prefers-color-scheme: light), (prefers-color-scheme: no-preference) {
      :root,
      body #app {
        {{ generateThemeVariables(themes.light) }}
      }
    }

    body #app.dark {
      {{ generateThemeVariables(themes.dark) }}
    }

    @media (prefers-color-scheme: dark) {
      :root,
      body #app {
        {{ generateThemeVariables(themes.dark) }}
      }
    }
  </DynamicStyle>
</template>

<script>
export default {
  name: 'DynamicTheme',
  props: {
    themes: {
      type: Object,
      required: true,
    },
  },
  methods: {
    /**
     * Generates CSS variables from a theme object.
     *
     * @param {object} theme - The theme object containing CSS variable key-value pairs.
     * @returns {string} - A string containing the generated CSS variables.
     */
    generateThemeVariables(theme) {
      if (!theme) {
        console.warn('Theme is undefined.  Returning empty string.');
        return '';
      }

      const cssVariables = Object.entries(theme)
        .map(([variable, value]) => {
          if (!value) {
            value = 'initial';
          } else if (variable === 'background-image') {
            value = `url(${value})`;
          }
          return `--${variable}: ${value};`;
        })
        .join('\n');

      return cssVariables;
    },
  },
};
</script>
