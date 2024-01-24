// 弹框组件
import Vue from "vue";
import EventController from "@/event-controller/index";


let zIndex = 1000; // 初始 z-index 值

function mountModalInstance(VueComponent) {
  debugger;
  const Modal = Vue.extend(VueComponent);
  const modalInstance = new Modal().$mount();

  // 设置弹框容器元素的 z-index 值
  const modalContainer = document.createElement("div");
  modalContainer.style.zIndex = zIndex++;
  modalContainer.classList.add("modal-container" + VueComponent.name + '-' + zIndex);

  modalContainer.appendChild(modalInstance.$el);
  document.body.appendChild(modalContainer);

  // 在组件销毁时，手动销毁容器元素
  debugger;
  modalInstance.$on("hook:beforeDestroy", () => {
    debugger;
    if (modalContainer.parentNode) {
      modalContainer.removeChild(modalInstance.$el);
      document.body.removeChild(modalContainer);
    }
  });

  // 将弹框实例保存到 extendController
  console.log(EventController, 'EventController');
  EventController.associate(modalInstance);

  return modalInstance;
}

export default mountModalInstance;
