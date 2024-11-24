
import js from "@eslint/js";
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  eslintConfigPrettier,
  {
    files: ['**/*.{vue,js,jsx,mjs,cjs}'],
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/require-default-prop": "off",
      "vue/no-v-html": "off",
    },
  }, 
  {
    ignores: ["**/dist/"],
  }
];
