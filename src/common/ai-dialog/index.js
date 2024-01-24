import Vue from "vue";
import AiDialog from "./index.vue";

// 获取vue实例构造函数
const AiDialogConstructor = Vue.extend(AiDialog);
let instance;

const AiDialogFn = function (options) {
  instance = new AiDialogConstructor();
  instance.$mount();
  document.body.appendChild(instance.$el);
  return instance.show(options);
};

export default AiDialogFn;

// 使用方式
// this.$AiDialog({
//   title: "提示",
// })

// 唐长老写的一个弹窗组件
// import Vue from 'vue';
// import ChatgptAiChatDrawerVue from './chatgpt-ai-chat-drawer.vue';

// // 使用Vue.extend()方法创建一个Vue组件构造器
// const ChatgptAiChatDrawerConstructor = Vue.extend({
//   ...ChatgptAiChatDrawerVue,  // 使用聊天窗口组件作为模板
//   parent: window.APaaSSDK.context.globalVueContext.$root  // 设置组件的父级Vue实例
// });
// let instance;

// // 定义聊天窗口组件对象
// const ChatgptAiChatDrawer = {
//   // 显示聊天窗口组件
//   show() {
//     instance = new ChatgptAiChatDrawerConstructor().$mount();  // 创建组件实例并挂载到DOM上
//     instance.onClose = () => {
//       ChatgptAiChatDrawer.hide();  // 定义关闭组件的方法
//     };
//     document.body.appendChild(instance.$el);  // 将组件的DOM元素添加到body中
//     instance.show();  // 显示组件
//   },
//   // 隐藏聊天窗口组件
//   hide() {
//     instance && instance.$destroy();  // 销毁组件实例
//     document.body.removeChild(instance && instance.$el);  // 从DOM中移除组件的DOM元素
//   }
// };

// export default ChatgptAiChatDrawer;  // 导出聊天窗口组件
