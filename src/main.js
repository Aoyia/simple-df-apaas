import Vue from "vue";
import App from "./App.vue";
import router from "./router";
// 引入element-ui
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import AiDialogFn from "./common/ai-dialog/index.js";
import "@/common/global-event/index.js";

Vue.config.productionTip = false;

Vue.use(ElementUI);
Vue.prototype.$aiDialog = AiDialogFn;

new Vue({
  router,
  render: (h) => h(App),
}).$mount("#app");
