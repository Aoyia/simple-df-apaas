<template>
  <div class="home">HOME</div>
</template>

<script>
import EventController from "@/event-controller/index.js";
export default {
  name: "HomeView",
  components: {},
  created() {
    EventController.trigger("AI_DIALOG", (result) => {
      console.log("只和当前事件有关");
      return "当前事件执行完成的回调";
    }).then(
      (res) => {
        debugger;
        console.log("确认");
      },
      (err) => {
        debugger;
        console.log("取消");
      }
    );
    // this.$aiDialog({
    //   title: "标题",
    //   content: "这是一个弹窗",
    // }).then(
    //   () => {
    //     console.log("确认");
    //   },
    //   () => {
    //     console.log("取消");
    //   }
    // );
  },
};
</script>
