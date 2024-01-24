import EventController from "@/event-controller/index";
import mountModalInstance from "@/event-controller/mount-modal-instance.js";
import AiDialog from "./AiDialog.vue";

EventController.register("AI_DIALOG", (options) => {
  const AiDialogInstance = mountModalInstance(AiDialog);
  debugger;
  return AiDialogInstance.show(options);
});

EventController.register("AI_DIALOG", (options) => {
  const AiDialogInstance = mountModalInstance(AiDialog);
  return AiDialogInstance.show(options);
});

EventController.register("AI_DIALOG", (options) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("定时器结束");
    }, 2000);
  });
});
