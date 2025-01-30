import { createApp, h } from "vue";
import App from "./App.vue";

import "@fortawesome/fontawesome-free/css/all.css";
import "./assets/app.scss";

const app = createApp(App);

app.component("DynamicStyle", (_props, context) => {
  return h("style", {}, context.slots);
});

app.mount("#app-mount");
