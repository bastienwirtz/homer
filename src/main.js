import "./assets/app.scss";
import { createApp, h } from "vue";
import App from "./App.vue";

const app = createApp(App);
import Generic from "./components/services/Generic.vue";

app
  .component("Generic", Generic)
  .component("DynamicStyle", (_props, context) => {
    return h("style", {}, context.slots);
  });

app.mount("#app-mount");
