import { createApp, h } from "vue";
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
 
import App from "./App.vue";

import "@fortawesome/fontawesome-free/css/all.css";
import "./assets/app.scss";
 
const app = createApp(App);

injectSpeedInsights();
inject();

app.component("DynamicStyle", (_props, context) => {
  return h("style", {}, context.slots);
});

app.mount("#app-mount");
